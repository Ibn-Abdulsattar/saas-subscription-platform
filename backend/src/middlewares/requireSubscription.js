import { Subscription } from "../models/subscription.model";
import { SubscriptionPlan } from "../models/subscriptionPlan.model";
import ExpressError from "../utils/expressError";
import wrapAsync from "../utils/wrapAsync";

const requireSubscription = (allowedPlans = []) =>
  wrapAsync(async (req, res, next) => {
    const subscription = await Subscription.findOne({
      where: { user_id: req.user.user_id, status: "active" },
      include: [{ model: SubscriptionPlan, as: "plan" }],
    });

    if (!subscription) {
      return next(new ExpressError("Active subscription required", 403));
    }

    if (
      allowedPlans.length > 0 &&
      !allowedPlans.includes(subscription.plan.plan_type)
    ) {
      return next(
        new ExpressError(
          "You don't have access to this resource. Please upgrade your subscription.",
        ),
      );
    }
  });
