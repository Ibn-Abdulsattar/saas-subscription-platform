import { Op } from "sequelize";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { Payment } from "../models/payment.model.js";
import ExpressError from "../utils/expressError.js";

export const globalSearch = async (req, res, next) => {
  const { q } = req.query;

  if (!q) return next(ExpressError("Search query is required"), 400);

  const searchCondition = {
    [Op.iLike]: `%${q}%`,
  };

  const [users, projects, tasks, payments] = await Promise.all([
    User.findAll({
      where: {
        user_id: req.user.user_id,
        [Op.or]: [{ username: searchCondition }, { email: searchCondition }],
      },
      limit: 10,
    }),

    Project.findAll({
      where: {
        user_id: req.user.user_id,
        [Op.or]: [{ title: searchCondition }, { description: searchCondition }],
      },
      limit: 10,
    }),

    Task.findAll({
      where: {
        assigned_to: {[Op.contains]: [req.user.user_id]},
        [Op.or]: [{ title: searchCondition }, { description: searchCondition }],
      },
      limit: 10,
    }),

    Payment.findAll({
      where: {
        user_id: req.user.user_id,
        stripe_invoice_id: searchCondition,
      },
      limit: 10,
    }),
  ]);

  return res.json({
    users,
    projects,
    tasks,
    payments,
  });
};
