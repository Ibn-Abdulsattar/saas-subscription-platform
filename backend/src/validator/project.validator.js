import { checkSchema, validationResult } from "express-validator";

export const createProjectSchema = checkSchema({
  title: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Title is required",
    },
    trim: true,
    isLength: {
      options: { min: 3, max: 150 },
      errorMessage: "Title must be between 3 and 150 characters",
    },
  },

  description: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Description is required",
    },
    trim: true,
    isLength: {
      options: { min: 10, max: 5000 },
      errorMessage: "Description must be between 10 and 5000 characters",
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


export const updateProjectSchema = checkSchema({
  id: {
    in: ["params"],
    notEmpty: {
      errorMessage: "Project ID is required",
    },
    isInt: {
      errorMessage: "Project ID must be a valid integer",
    },
    toInt: true,
  },

  title: {
    in: ["body"],
    optional: true,
    trim: true,
    isLength: {
      options: { min: 3, max: 150 },
      errorMessage: "Title must be between 3 and 150 characters",
    },
  },

  description: {
    in: ["body"],
    optional: true,
    trim: true,
    isLength: {
      options: { min: 10, max: 5000 },
      errorMessage: "Description must be between 10 and 5000 characters",
    },
  },

  bodyCheck: {
    custom: {
      options: (value, { req }) => {
        if (!req.body.title && !req.body.description) {
          throw new Error("At least title or description must be provided");
        }
        return true;
      },
    },
  },
});

export const deleteProjectSchema = checkSchema({
  id: {
    in: ["params"],
    notEmpty: {
      errorMessage: "Project ID is required",
    },
    isInt: {
      errorMessage: "Project ID must be a valid integer",
    },
    toInt: true,
  },
});