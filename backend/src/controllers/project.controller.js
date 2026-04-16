import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import Cloudinary from "../utils/cloudinary.js";
import ExpressError from "../utils/expressError.js";
import { logActivity } from "../services/logActivity.js";
import { Team } from "../models/team.model.js";

export const createProject = async (req, res, next) => {
  const { title, description, deadline } = req.body;

  let pdf = null;

  const file = req.file;

  if (!title || !description || !deadline) {
    return next(new ExpressError(" title, description and deadline are required", 400));
  }

  if (file) {
    try {
      const result = await Cloudinary(file);

      pdf = result.secure_url;
      console.log("pdf_url =", result.secure_url);
    } catch (err) {
      return next(new ExpressError("pdf upload failed", 500));
    }
  }

  const project = await Project.create({
    title,
    description,
    pdf,
    user_id: req.user.user_id,
    deadline: deadline,
  });

  await logActivity(req.user.user_id, "Created", "Project", project.id);

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: project,
  });
};

export const getAllProjects = async (req, res, next) => {
  const { count, rows: projects } = await Project.findAndCountAll({
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

  await logActivity(req.user.user_id, "Updated", "Project", project.id);

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

  await logActivity(req.user.user_id, "Deleted", "Project", project.id);


  res.status(200).json({
    success: true,
    message: "Project and its tasks deleted successfully",
  });
};

export const assignProjectToTeam = async(req, res, next)=>{
      const { teamId } = req.body;
          const project = await Project.findByPk(req.params.id);

  if (!project) {
    return next(new ExpressError("Project not found", 404));
  }

  const team = await Team.findByPk(teamId);

    if (!team) {
    return next(new ExpressError("Team not found", 404));
  }

  await project.update({teamId});

  await logActivity(req.user.user_id, "Assigned", "Project", project.id);

  return res.status(200).json({
    message: "Project assigned to team successfully",
    data: project,
  });
};
