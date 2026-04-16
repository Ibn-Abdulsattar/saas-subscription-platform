import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import ExpressError from "../utils/expressError.js";
import { logActivity } from "../services/logActivity.js";
import { Op } from "sequelize";
import UserChecklistItem from "../models/userChecklist.model.js";
import { User } from "../models/user.model.js";

export const createTask = async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findByPk(projectId);
  if (!project) {
    return next(new ExpressError("Project not found", 404));
  }

  const {
    title,
    description,
    assigned_to,
    status = "pending",
    priority,
    due_date,
    checklist_template,
  } = req.body;

  if (!title || !assigned_to || assigned_to.length === 0) {
    return next(
      new ExpressError("Title and Assigned To Users are required", 400),
    );
  }

  if (!priority || !due_date) {
    return next(new ExpressError("Priority and Due Date required", 400));
  }

  const task = await Task.create({
    project_id: projectId,
    title,
    description,
    assigned_to,
    status,
    priority,
    due_date,
  });

  if (assigned_to && assigned_to.length > 0 && checklist_template) {
    const checklistEntries = [];

    assigned_to.forEach((userId) => {
      checklist_template.forEach((itemName) => {
        checklistEntries.push({
          taskId: task.id,
          userId: userId,
          itemName: itemName,
          isCompleted: false,
        });
      });
    });

    await UserChecklistItem.bulkCreate(checklistEntries);
  }

  await logActivity(req.user.user_id, "Created", "Task", task.id);

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: task,
  });
};

// export const getTasksByProject = async (req, res, next) => {
//   const { projectId } = req.params;
//   const { status, priority } = req.query;

//   const project = await Project.findByPk(projectId);
//   if (!project) {
//     return next(new ExpressError("Project not found", 404));
//   }

//   const where = { project_id: projectId };
//   if (status) where.status = status;
//   if (priority) where.priority = priority;

//   const { count, rows: tasks } = await Task.findAndCountAll({
//     where,
//     order: [["created_at", "DESC"]],
//   });

//   const todayDate = new Date();

//   const updatedTasks = tasks.map((task) => {
//     const isOverDue =
//       new Date(task.due_date) < todayDate && task.status !== "compeleted";
//     task.isOverDue = isOverDue;

//     return task;
//   });

//   res.status(200).json({
//     success: true,
//     total: count,
//     data: updatedTasks,
//   });
// };

export const getTasksByProject = async (req, res, next) => {
  const { projectId } = req.params;
  const { status, priority } = req.query;

  const project = await Project.findByPk(projectId);
  if (!project) return next(new ExpressError("Project not found", 404));

  const where = { project_id: projectId };
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const tasks = await Task.findAll({
    where,
    order: [["created_at", "DESC"]],
  });

  const allUserIds = [...new Set(tasks.flatMap((t) => t.assigned_to || []))];

  const users = await User.findAll({
    where: { user_id: allUserIds },
    attributes: ["user_id", "username", "email", "jobTitle"],
  });

  const userMap = users.reduce((acc, user) => {
    acc[user.user_id] = user;
    return acc;
  }, {});

  const todayDate = new Date();

  const updatedTasks = tasks.map((task) => {
    const taskJson = task.toJSON();

    taskJson.assigned_users = (taskJson.assigned_to || [])
      .map((id) => userMap[id])
      .filter(Boolean);

    taskJson.isOverDue =
      new Date(task.due_date) < todayDate && task.status !== "completed";

    return taskJson;
  });

  res.status(200).json({
    success: true,
    total: updatedTasks.length,
    data: updatedTasks,
  });
};

export const getTaskById = async (req, res, next) => {
  const { projectId, id } = req.params;

  const task = await Task.findOne({
    where: { id, project_id: projectId },
    include: [{ model: Project, as: "project" }],
  });

  if (!task) {
    return next(new ExpressError("Task not found", 404));
  }

  res.status(200).json({ success: true, data: task });
};

export const updateTask = async (req, res, next) => {
  const { projectId, id } = req.params;

  const task = await Task.findOne({ where: { id, project_id: projectId } });
  if (!task) {
    return next(new ExpressError("Task not found", 404));
  }

  const { title, description, assigned_to, status, priority, due_date } =
    req.body;

  await task.update({
    title,
    description,
    assigned_to,
    status,
    priority,
    due_date,
  });

  await logActivity(req.user.user_id, "Updated", "Task", id);

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
};

export const deleteTask = async (req, res, next) => {
  const { projectId, id } = req.params;

  const task = await Task.findOne({ where: { id, project_id: projectId } });
  if (!task) {
    return next(new ExpressError("Task not found", 404));
  }

  await task.destroy();

  await logActivity(req.user.user_id, "Delated", "Task", id);

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
};

export const getFilteredTasks = async (req, res, next) => {
  const {
    status,
    priority,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = req.query;

  const whereClause = {};

  if (status) {
    whereClause.status = status;
  }

  if (priority) {
    whereClause.priority = priority;
  }

  if (startDate && endDate) {
    whereClause.created_at = {
      [Op.between]: [
        new Date(startDate),
        new Date(endDate).setHours(23 * 59 * 59 * 999),
      ],
    };
  }

  whereClause.assigned_to = {
    [Op.contains]: [req.user.user_id],
  };

  const offset = (page - 1) * parseInt(limit);

  const { count, rows } = await Task.findAndCountAll({
    where: whereClause,
    offset: offset,
    limit: parseInt(limit),
    order: [["created_at", "DESC"]],
    include: [
      {
        model: Project,
        as: "project",
        attributes: ["title", "id", "description"],
      },
    ],
    distinct: true,
  });

  return res.json({
    total: count,
    tasks: rows,
    currentPage: parseInt(page),
    totalPages: Math.ceil(count / limit),
  });
};

export const toggleChecklistItem = async (req, res) => {
  const { id: taskId, itemId } = req.params;

  const item = await UserChecklistItem.findOne({
    where: { id: itemId, userId: req.user.user_id, taskId: taskId },
  });

  item.isCompleted = !item.isCompleted;
  await item.save();

  res.status(200).json({ success: true, item });
};
