import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
  addSubscriptionPlan,
  allSubscriptionPlans,
} from "../controllers/plan.controller.js";
import auth from "../middlewares/auth.js";
import { addSubscriptionPlanSchema } from "../validator/plan.validator.js";
import { validateRequest } from "../middlewares/validationRequest.js";
const router = Router();

router
  .route("/plans")
  .post( auth(["user"]), addSubscriptionPlanSchema, validateRequest("Plan"), wrapAsync(addSubscriptionPlan))
  .get( auth(["user"]), wrapAsync(allSubscriptionPlans));

  export default router;
