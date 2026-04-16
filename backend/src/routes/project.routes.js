import { Router } from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignProjectToTeam,
} from "../controllers/project.controller.js";
import taskRoutes from "./task.routes.js";
import wrapAsync from "../utils/wrapAsync.js";
import upload from "../services/upload.js";
import auth from "../middlewares/auth.js";
import {
  createProjectSchema,
  deleteProjectSchema,
  updateProjectSchema,
} from "../validator/project.validator.js";
import { validateRequest } from "../middlewares/validationRequest.js";

const router = Router();

router.use("/:projectId/tasks", taskRoutes);

router
  .route("/")
  .post(
    auth(["admin"]),
    upload.single("media"),
    createProjectSchema,
    validateRequest("Project"),
    wrapAsync(createProject),
  )
  .get(auth(["admin"]), wrapAsync(getAllProjects));
router
  .route("/:id")
  .get(auth(["admin"]), wrapAsync(getProjectById))
  .put(
    auth(["admin"]),
    updateProjectSchema,
    validateRequest("Project"),
    wrapAsync(updateProject),
  )
  .delete(
    auth(["admin"]),
    deleteProjectSchema,
    validateRequest("Project"),
    wrapAsync(deleteProject),
  );
router
  .route("/:id/assign-team")
  .post(auth(["admin", "manager"]), wrapAsync(assignProjectToTeam));

export default router;
