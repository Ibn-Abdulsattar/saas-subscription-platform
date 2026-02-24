import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
  paymentHistory,
  subscriptionStatus,
  stripeCheckoutSession,
} from "../controllers/payment.controller.js";
import auth from "../middlewares/auth.js";
const router = Router();

router.route("/history").get( auth(["user"]), wrapAsync(paymentHistory));
router.route("/subscription").get(auth(["user"]), wrapAsync(subscriptionStatus));
router.route("/checkout").post(auth(["user"]), wrapAsync(stripeCheckoutSession));

export default router;
    