import { SubscriptionPlan } from "../models/subscriptionPlan.model.js";

const PRICE_MAp = {
  basic: process.env.Basic_Plan_Price_ID,
  pro: process.env.Pro_Plan_Price_ID,
  free: "FREE_PLAN",
};

export const addSubscriptionPlan = async (req, res, next) => {
  const { planType, billingInterval, price } = req.body;

  const [plan, created] = await SubscriptionPlan.findOrCreate({
    where: { plan_type: planType, billing_interval: billingInterval },
    defaults: {
      plan_type: planType,
      billing_interval: billingInterval,
      price: price,
      stripe_price_id: PRICE_MAp[planType],
    },
  });

  return res.status(201).json({ created, plan });
};

export const allSubscriptionPlans = async(req, res, next)=>{
  const allPlans = await SubscriptionPlan.findAll({
    order: [["price", "ASC"]]
  });

  return res.status(200).json({allPlans});
}
