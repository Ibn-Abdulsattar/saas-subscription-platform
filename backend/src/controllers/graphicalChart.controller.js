import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";
import { Payment } from "../models/payment.model.js";
import { sequelize } from "../config/db.js";

export const getMonthlyRevenu = async (req, res, next) => {
  const revenu = await Payment.findAll({
    attributes: [
      [
        sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at")),
        "month",
      ],
      [sequelize.fn("SUM", sequelize.col("amount")), "total"],
    ],
    where: { status: "paid" },
    group: ["month"],
    order: [[sequelize.literal("month"), "ASC"]],
  });

  return res.status(200).json({ revenu });
};

export const getTaskStatusStats = async (req, res, next) => {
  const status = await Task.findAll({
    attributes: [
      "status",
      [sequelize.fn("COUNT", sequelize.col("status")), "count"],
    ],
    group: ["status"],
  });

  return res.status(200).json({ status });
};

export const getUserGrowth = async (req, res, next) => {
  const users = await User.findAll({
    attributes: [
      [
        sequelize.fn("DATE_TRUNC", "month", sequelize.col("created_at")),
        "month",
      ],
      [sequelize.fn("COUNT", sequelize.col("user_id")), "count"],
    ],
    group: ["month"],
    order: [sequelize.literal("month"), "ASC"],
  });

  return res.status(200).json({ users });
};
