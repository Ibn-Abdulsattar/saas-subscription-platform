import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import ExpressError from "../utils/expressError.js";

export const createProject = async (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return next(new ExpressError(" title, and description are required", 400));
  }

  const project = await Project.create({ title, description });

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: project,
  });
};

export const getAllProjects = async (req, res, next) => {
  const { user } = req;

  const { count, rows: projects } = await Project.findAndCountAll({
    where: { user_id: user.user_id },
    include: [{ model: Task, as: "tasks" }],
    order: [["created_at", "DESC"]],
  });

  res.status(200).json({
    success: true,
    total: count,
    data: projects,
  });
};

export const getProjectById = async (req, res, next) => {
  const project = await Project.findByPk(req.params.id, {
    include: [{ model: Task, as: "tasks" }],
  });

  if (!project) {
    return next(new ExpressError("Project not found", 404));
  }

  res.status(200).json({ success: true, data: project });
};

export const updateProject = async (req, res, next) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
        return next(new ExpressError("Project not found", 404));
  }

  const { title, description } = req.body;
  await project.update({ title, description });

  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: project,
  });
};

export const deleteProject = async (req, res, next) => {
  const project = await Project.findByPk(req.params.id);

  if (!project) {
        return next(new ExpressError("Project not found", 404));
  }

  await project.destroy(); 

  res.status(200).json({
    success: true,
    message: "Project and its tasks deleted successfully",
  });
};
