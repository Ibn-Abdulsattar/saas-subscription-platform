import { Router } from "express";
import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";
import wrapAsync from "../utils/wrapAsync.js";

const router = Router({ mergeParams: true });

router.route("/").post(wrapAsync(createTask)).get(wrapAsync(getTasksByProject));
router
  .route("/:id")
  .get(wrapAsync(getTaskById))
  .put(wrapAsync(updateTask))
  .delete(wrapAsync(deleteTask));

export default router;
