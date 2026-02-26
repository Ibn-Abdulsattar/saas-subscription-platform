import { checkSchema, validationResult } from "express-validator";

export const updateProfileSchema = checkSchema({
  username: {
    in: ["body"],
    optional: true,
    trim: true,
    isLength: {
      options: { min: 3, max: 30 },
      errorMessage: "Username must be between 3 and 30 characters",
    },
    matches: {
      options: [/^[a-zA-Z0-9_]+$/],
      errorMessage:
        "Username can only contain letters, numbers, and underscores",
    },
  },

  user: {
    custom: {
      options: (value, { req }) => {
        if (!req.user || !req.user.user_id) {
          throw new Error("Unauthorized: user not found");
        }
        return true;
      },
    },
  },
});