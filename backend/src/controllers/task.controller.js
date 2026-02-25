import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import ExpressError from "../utils/expressError.js";

export const createTask = async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findByPk(projectId);
  if (!project) {
    return next(new ExpressError("Project not found", 404));
  }

  const { title, description, assigned_to, status, priority, due_date } =
    req.body;

  if (!title) {
    return next(new ExpressError("Title is required", 400));
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

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: task,
  });
};

export const getTasksByProject = async (req, res, next) => {
  const { projectId } = req.params;
  const { status, priority } = req.query;

  const project = await Project.findByPk(projectId);
  if (!project) {
    return next(new ExpressError("Project not found", 404));
  }

  const where = { project_id: projectId };
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const { count, rows: tasks } = await Task.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
  });

  const todayDate = new Date();

  const updatedTasks = tasks.map(task=>{
    const isOverDue =  new Date(task.due_date) < todayDate  && task.status !== "compeleted";

    return {
      ...task,
      isOverDue
    }
     
  })

  res.status(200).json({
    success: true,
    total: count,
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

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
};
