import { Router } from "express";
import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";
import wrapAsync from "../utils/wrapAsync.js";
import auth from "../middlewares/auth.js";
import { createTaskSchema, deleteTaskSchema, updateTaskSchema } from "../validator/task.valdator.js";
import { validateRequest } from "../middlewares/validationRequest.js";

const router = Router({ mergeParams: true });

router.route("/").post( auth(["user"]),createTaskSchema, validateRequest("Task"), wrapAsync(createTask)).get(wrapAsync(getTasksByProject));
router
  .route("/:id")
  .get( auth(["user"]), wrapAsync(getTaskById))
  .put( auth(["user"]),updateTaskSchema,validateRequest("Task"), wrapAsync(updateTask))
  .delete( auth(["user"]), deleteTaskSchema, validateRequest("Task"), wrapAsync(deleteTask));

export default router;
