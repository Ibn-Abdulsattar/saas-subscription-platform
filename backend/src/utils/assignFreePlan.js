import { Subscription } from "../models/subscription.model.js";
import { SubscriptionPlan } from "../models/subscriptionPlan.model.js";
import ExpressError from "./expressError.js";

const assignFreePlan = async (user) => {
  const freePlan = await SubscriptionPlan.findOne({
    where: { plan_type: "free" },
  });

  if (!freePlan) {
    throw new ExpressError("Free plan not found", 500);
  }

  await Subscription.create({
    user_id: user.user_id,
    plan_id: freePlan.id,
    status: "active",
    current_period_start: new Date(),
    stripe_subscription_id: "free_plan",
    current_period_end: new Date(2099, 11, 1),
  });
};

export default assignFreePlan;
