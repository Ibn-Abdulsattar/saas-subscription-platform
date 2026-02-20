import { checkSchema, validationResult } from "express-validator";
import ExpressError from "../utils/expressError.js";

export const registerSchema = checkSchema({
  email: {
    errorMessage: "Please provide a valid email address", 
    isEmail: true,
    normalizeEmail: true,
  },
  username: {
    errorMessage: "Username is required and must be at least 3 characters long",
    notEmpty: true,
    isLength: { options: { min: 3 } },
  },
  password: {
    errorMessage: "Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols",
    notEmpty: true,
    isStrongPassword: {
      options: {
        minLength: 8,
        minLowerCase: 1,
        minUpperCase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }
    },
  },
});

export const loginSchema = checkSchema({
  email: {
    errorMessage: "A valid email is required to login",
    isEmail: true,
    normalizeEmail: true,
  },
  password: {
    errorMessage: "Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols",
    notEmpty: true,
    isStrongPassword: {
      options: {
        minLength: 8,
        minLowerCase: 1,
        minUpperCase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }
    },
  },
});

export const validateAuth = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ExpressError("Validation failed", 400, errors.array()));
  }
  next();
};
