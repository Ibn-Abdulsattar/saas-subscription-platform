import { globalSearch } from "../controllers/search.controller.js";
import {Router} from "express";
import auth from "../middlewares/auth.js";
import wrapAsync from "../utils/wrapAsync.js";
import { getFilteredTasks } from "../controllers/task.controller.js";
const router = Router();

router.get("/global", auth(["user", "manager", "admin"]), wrapAsync(globalSearch));
router.get("/task", auth(["user", "manager", "admin"]), wrapAsync(getFilteredTasks));

export default router;