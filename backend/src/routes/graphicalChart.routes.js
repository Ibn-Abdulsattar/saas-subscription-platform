import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
  getMonthlyRevenu,
  getTaskStatusStats,
  getUserGrowth,
} from "../controllers/graphicalChart.controller.js";
import auth from "../middlewares/auth.js";
const router = Router();

router.route("/revenue").get( auth(["user", "manager", "admin"]), wrapAsync(getMonthlyRevenu));
router.route("/task").get( auth(["user", "manager", "admin"]), wrapAsync(getTaskStatusStats));
router.route("/growth").get( auth(["user", "manager", "admin"]), wrapAsync(getUserGrowth));

export default router;
