import { checkSchema, validationResult } from "express-validator";

export const stripeCheckoutSessionSchema = checkSchema({
  planType: {
    in: ["body"],
    errorMessage: "planType is required and must be a valid string",
    notEmpty: {
      errorMessage: "planType is required",
    },
    isString: {
      errorMessage: "planType must be a string",
    },
    trim: true,
    isIn: {
      options: [["basic", "free", "pro"]], 
      errorMessage: "Invalid plan type selected",
    },
  },

  billingInterval: {
    in: ["body"],
    errorMessage: "billingInterval is required and must be valid",
    notEmpty: {
      errorMessage: "billingInterval is required",
    },
    isString: {
      errorMessage: "billingInterval must be a string",
    },
    trim: true,
    isIn: {
      options: [["monthly", "yearly"]], 
      errorMessage: "Invalid billing interval selected",
    },
  },
});