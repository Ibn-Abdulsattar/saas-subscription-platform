import { checkSchema } from "express-validator";

export const createTaskSchema = checkSchema({
  projectId: {
    in: ["params"],
    notEmpty: {
      errorMessage: "Project ID is required",
    },
    isUUID: {
      errorMessage: "Project ID must be a valid UUID",
    },
  },

  title: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Title is required",
    },
    trim: true,
    isLength: {
      options: { min: 3, max: 200 },
      errorMessage: "Title must be between 3 and 200 characters",
    },
  },

  description: {
    in: ["body"],
    optional: true,
    trim: true,
    isLength: {
      options: { max: 5000 },
      errorMessage: "Description cannot exceed 5000 characters",
    },
  },

  assigned_to: {
    in: ["body"],
    optional: true,
    isUUID: {
      errorMessage: "assigned_to must be a valid UUID",
    },
  },

  priority: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Priority is required",
    },
    isIn: {
      options: [["low", "medium", "high"]],
      errorMessage: "Priority must be low, medium, or high",
    },
  },

  due_date: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Due date is required",
    },
    isISO8601: {
      errorMessage: "Due date must be a valid date",
    },
    toDate: true,
    custom: {
      options: (value) => {
        if (new Date(value) < new Date()) {
          throw new Error("Due date must be in the future");
        }
        return true;
      },
    },
  },
});

export const updateTaskSchema = checkSchema({
  projectId: {
    in: ["params"],
    notEmpty: {
      errorMessage: "Project ID is required",
    },
    isUUID: {
      errorMessage: "Project ID must be a valid UUID",
    },
  },

  id: {
    in: ["params"],
    notEmpty: {
      errorMessage: "Task ID is required",
    },
    isUUID: {
      errorMessage: "Task ID must be a valid UUID",
    },
  },

  title: {
    in: ["body"],
    optional: true,
    trim: true,
    isLength: {
      options: { min: 3, max: 200 },
      errorMessage: "Title must be between 3 and 200 characters",
    },
  },

  description: {
    in: ["body"],
    optional: true,
    trim: true,
    isLength: {
      options: { max: 5000 },
      errorMessage: "Description cannot exceed 5000 characters",
    },
  },

  assigned_to: {
    in: ["body"],
    optional: true,
    isUUID: {
      errorMessage: "assigned_to must be a valid UUID",
    },
  },

  status: {
    in: ["body"],
    optional: true,
    isIn: {
      options: [["pending", "in_progress", "completed"]],
      errorMessage: "Invalid task status",
    },
  },

  priority: {
    in: ["body"],
    optional: true,
    isIn: {
      options: [["low", "medium", "high"]],
      errorMessage: "Priority must be low, medium, or high",
    },
  },

  due_date: {
    in: ["body"],
    optional: true,
    isISO8601: {
      errorMessage: "Due date must be a valid date",
    },
    toDate: true,
  },

  bodyCheck: {
    custom: {
      options: (value, { req }) => {
        if (
          !req.body.title &&
          !req.body.description &&
          !req.body.assigned_to &&
          !req.body.status &&
          !req.body.priority &&
          !req.body.due_date
        ) {
          throw new Error("At least one field must be provided for update");
        }
        return true;
      },
    },
  },
});

export const deleteTaskSchema = checkSchema({
  projectId: {
    in: ["params"],
    notEmpty: {
      errorMessage: "Project ID is required",
    },
    isUUID: {
      errorMessage: "Project ID must be a valid UUID",
    },
  },

  id: {
    in: ["params"],
    notEmpty: {
      errorMessage: "Task ID is required",
    },
    isUUID: {
      errorMessage: "Task ID must be a valid UUID",
    },
  },
});