import { Router } from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";
import taskRoutes from "./task.routes.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = Router();

router.use("/:projectId/tasks", taskRoutes);

router.route("/").post(wrapAsync(createProject)).get(wrapAsync(getAllProjects));
router
  .route("/:id")
  .get(wrapAsync(getProjectById))
  .put(wrapAsync(updateProject))
  .delete(wrapAsync(deleteProject));

export default router;
