const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const success_url = `${process.env.FRONTEND_URL}/success`;
const cancel_url = `${process.env.FRONTEND_URL}/cancel`;
import Stripe from "stripe";
const stripe = new Stripe(stripeSecretKey);
import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { SubscriptionPlan } from "../models/subscriptionPlan.model.js";
import ExpressError from "../utils/expressError.js";

export const stripeCheckoutSession = async (req, res, next) => {
  const { planType, billingInterval } = req.body;

  if (!planType || !billingInterval) {
    return next(new ExpressError("planType and billingInterval are required", 400));
  }

  const user = await User.findByPk(req.user.user_id);

  const plan = await SubscriptionPlan.findOne({
    where: { plan_type: planType, billing_interval: billingInterval },
  });

  if (!plan || plan.plan_type === "free") {
    return next(new ExpressError("Invalid paid plan selected", 400));
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer: user.stripe_customer_id,
    success_url: success_url,
    cancel_url: cancel_url,
    line_items: [
      {
        price: plan.stripe_price_id,
        quantity: 1,
      },
    ],
    mode: "subscription",
    metadata: {
      user_id: user.user_id.toString(),
      plan_id: plan.id.toString(),
    },
  });

  res.status(200).send({
    message: "Stripe session created successfully",
    sessionId: session.id,
    url: session.url,
  });
};

export const stripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (e) {
    return next(new ExpressError(`Webhook Error: ${e.message}`, 400));
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { user_id, plan_id } = session.metadata;

      await Subscription.update(
        { status: "canceled" },
        {
          where: {
            user_id: user_id,
          },
        },
      );

      const subscriptionId =
        session.subscription ??
        session.parent?.subscription_details?.subscription;

      await Subscription.create({
        user_id: user_id,
        plan_id: plan_id,
        status: "active",
        stripe_subscription_id: subscriptionId,
        current_period_start: new Date(),
        current_period_end: new Date(),
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      console.log(invoice);
      const subscriptionId =
        invoice.subscription ??
        invoice.parent?.subscription_details?.subscription;

      if (!subscriptionId) {
        console.log("invoice.subscription undefined");
        break;
      }

      const subscription = await Subscription.findOne({
        where: { stripe_subscription_id: subscriptionId },
      });

        if (!subscription) {
        console.log("Subscription not in DB yet. Creating a temporary record or skipping...");
        // Instead of breaking, we send a 202 to tell Stripe "Try again in a few seconds"
        return res.status(202).json({ message: "Processing dependency..." });
      }

      await Payment.create({
        user_id: subscription.user_id,
        stripe_invoice_id: invoice.id,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        payment_status: "paid",
        paid_at: new Date(invoice.status_transitions.paid_at * 1000),
      });

      await Subscription.update(
        {
          status: "active",
          current_period_start: new Date(invoice.period_start * 1000),
          current_period_end: new Date(invoice.period_end * 1000),
        },
        { where: { stripe_subscription_id: subscriptionId } },
      );
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
            const subscriptionId =
        invoice.subscription ??
        invoice.parent?.subscription_details?.subscription;

      await Subscription.update(
        {
          status: "past_due",
        },
        { where: { stripe_subscription_id: subscriptionId} },
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
            const subscriptionId =
        subscription.id ??
        subscription.parent?.subscription_details?.subscription;

      await Subscription.update(
        {
          status: "canceled",
        },
        {
          where: { stripe_subscription_id: subscriptionId },
        },
      );
      break;
    }
  }

  return res.status(200).json({
    recieved: true,
  });
};

export const subscriptionStatus = async (req, res, next) => {
  const subscription = await Subscription.findOne({
    where: { user_id: req.user.user_id, status: "active" },
    include: [{ model: SubscriptionPlan, as: "plan" }]
  });

  res.status(200).json({
    status: subscription?.status,
    plan: subscription?.plan?.plan_type,
    expires_at: subscription?.current_period_end,
  });
};

export const paymentHistory = async (req, res, next) => {
  const allPayments = await Payment.findAll({
    where: { user_id: req.user.user_id },
    order: [["paid_at", "DESC"]],
  });

  return res.status(200).json({
    payments: allPayments,
  });
};
