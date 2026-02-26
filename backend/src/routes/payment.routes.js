import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
  paymentHistory,
  subscriptionStatus,
  stripeCheckoutSession,
} from "../controllers/payment.controller.js";
import auth from "../middlewares/auth.js";
import { stripeCheckoutSessionSchema } from "../validator/payment.validator.js";
import { validateRequest } from "../middlewares/validationRequest.js";
const router = Router();

router.route("/history").get(auth(["user"]), wrapAsync(paymentHistory));
router
  .route("/subscription")
  .get(auth(["user"]), wrapAsync(subscriptionStatus));
router
  .route("/checkout")
  .post(
    auth(["user"]),
    stripeCheckoutSessionSchema,
    validateRequest("Payment"),
    wrapAsync(stripeCheckoutSession),
  );

export default router;
