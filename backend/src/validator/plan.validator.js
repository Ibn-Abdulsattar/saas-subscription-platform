import { checkSchema, validationResult } from "express-validator";

export const addSubscriptionPlanSchema = checkSchema({
  planType: {
    in: ["body"],
    notEmpty: {
      errorMessage: "planType is required",
    },
    isString: {
      errorMessage: "planType must be a string",
    },
    trim: true,
    isIn: {
      options: [["basic", "free", "pro"]], // adjust to your supported plans
      errorMessage: "Invalid plan type",
    },
  },

  billingInterval: {
    in: ["body"],
    notEmpty: {
      errorMessage: "billingInterval is required",
    },
    isString: {
      errorMessage: "billingInterval must be a string",
    },
    trim: true,
    isIn: {
      options: [["monthly", "yearly"]],
      errorMessage: "Invalid billing interval",
    },
  },

  price: {
    in: ["body"],
    notEmpty: {
      errorMessage: "price is required",
    },
    isFloat: {
      options: { min: 0 },
      errorMessage: "price must be a positive number",
    },
    toFloat: true,
  },
});
