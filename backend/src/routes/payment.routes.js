import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
  paymentHistory,
  subscriptionStatus,
  stripeCheckoutSession,
  cancelSubscription,
} from "../controllers/payment.controller.js";
import auth from "../middlewares/auth.js";
import { stripeCheckoutSessionSchema } from "../validator/payment.validator.js";
import { validateRequest } from "../middlewares/validationRequest.js";
const router = Router();

router.route("/history").get(auth(["user", "manager", "admin"]), wrapAsync(paymentHistory));
router
  .route("/subscription")
  .get(auth(["user", "manager", "admin"]), wrapAsync(subscriptionStatus));
router
  .route("/checkout")
  .post(
    auth(["user", "manager", "admin"]),
    stripeCheckoutSessionSchema,
    validateRequest("Payment"),
    wrapAsync(stripeCheckoutSession),
  );

  router.post("/cancel-subscription", auth(["user", "manager", "admin"]), wrapAsync(cancelSubscription));

export default router;
