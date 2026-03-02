import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";
import { Payment } from "../models/payment.model.js";
import { Op } from "sequelize";
import { Project } from "../models/project.model.js";

export const getSummaryStats = async (req, res, next) => {
  const totalUsers = await User.count({ where: { role: "user" } });

  const activeUsers = await User.count({
    where: {
      updated_at: { [Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  const totalProjects = await Project.count();

  const totalTasks = await Task.count();

  const completedTasks = await Task.count({
    where: { status: "completed" },
  });

  const totalRevenu = await Payment.sum("amount", {
    where: { payment_status: "paid" },
  });

  return res.status(200).json({
    totalUsers,
    activeUsers,
    totalProjects,
    totalTasks,
    completedTasks,
    totalRevenu,
  });
};
