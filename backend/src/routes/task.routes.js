import { Router } from "express";
import {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  toggleChecklistItem,
} from "../controllers/task.controller.js";
import wrapAsync from "../utils/wrapAsync.js";
import auth from "../middlewares/auth.js";
import {
  createTaskSchema,
  deleteTaskSchema,
  updateTaskSchema,
} from "../validator/task.valdator.js";
import { validateRequest } from "../middlewares/validationRequest.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .post(
    auth(["admin", "manager"]),
    createTaskSchema,
    validateRequest("Task"),
    wrapAsync(createTask),
  )
  .get(auth(["admin", "manager"]), wrapAsync(getTasksByProject));
router
  .route("/:id")
  .get(auth(["admin", "manager"]), wrapAsync(getTaskById))
  .put(
    auth(["admin", "manager"]),
    updateTaskSchema,
    validateRequest("Task"),
    wrapAsync(updateTask),
  )
  .delete(
    auth(["admin", "manager"]),
    deleteTaskSchema,
    validateRequest("Task"),
    wrapAsync(deleteTask),
  );
router.patch(
  "/:id/checklist/:itemId",
  auth(["user"]),
  wrapAsync(toggleChecklistItem),
);
export default router;
