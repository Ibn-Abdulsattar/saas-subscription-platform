import { validationResult } from "express-validator";
import ExpressError from "../utils/expressError.js";

export const validateRequest = (context = "Validation") => {
  return (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      }));

      return next(new ExpressError(`${context} validation failed`, 400, formattedErrors));
    }

    next();
  };
};