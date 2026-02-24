import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
  addSubscriptionPlan,
  allSubscriptionPlans,
} from "../controllers/plan.controller.js";
import auth from "../middlewares/auth.js";
const router = Router();

router
  .route("/plans")
  .post(wrapAsync(addSubscriptionPlan))
  .get(wrapAsync(allSubscriptionPlans));

  export default router;
