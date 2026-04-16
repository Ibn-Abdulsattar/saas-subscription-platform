import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { getRecentActivities } from "../controllers/activity.controller.js";
import auth from "../middlewares/auth.js";
const router = Router();


router.route("/").get( auth(["user", "manager", "admin"]), wrapAsync(getRecentActivities));

export default router;












