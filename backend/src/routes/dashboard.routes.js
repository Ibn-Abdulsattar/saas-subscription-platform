import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import { getSummaryStats } from "../controllers/dashboard.controller.js";
import auth from "../middlewares/auth.js";
const router = Router();


router.route("/stats").get( auth(["user", "manager", "admin"]), wrapAsync(getSummaryStats));

export default router;












