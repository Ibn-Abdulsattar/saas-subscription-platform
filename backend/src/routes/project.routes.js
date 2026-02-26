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
    auth(["user"]),
    upload.single("media"),
    createProjectSchema,
    validateRequest("Project"),
    wrapAsync(createProject),
  )
  .get(auth(["user"]), wrapAsync(getAllProjects));
router
  .route("/:id")
  .get(auth(["user"]), wrapAsync(getProjectById))
  .put(
    auth(["user"]),
    updateProjectSchema,
    validateRequest("Project"),
    wrapAsync(updateProject),
  )
  .delete(
    auth(["user"]),
    deleteProjectSchema,
    validateRequest("Project"),
    wrapAsync(deleteProject),
  );

export default router;
