import { Router } from "express";
import wrapAsync from "../utils/wrapAsync.js";
import {
  forgot,
  login,
  logout,
  register,
  resetPassword,
  google,
  changePassword,
} from "../controllers/auth.controller.js";
import {
  forgotSchema,
  loginSchema,
  registerSchema,
} from "../validator/auth.validator.js";
import auth from "../middlewares/auth.js";
import { validateRequest } from "../middlewares/validationRequest.js";
const router = Router();

router
  .route("/login")
  .post(loginSchema, validateRequest("Auth"), wrapAsync(login));
router
  .route("/register")
  .post(registerSchema, validateRequest("Auth"), wrapAsync(register));
router
  .route("/logout")
  .post(auth(["user", "admin", "manager"]), wrapAsync(logout));
router
  .route("/forgot")
  .post(forgotSchema, validateRequest("Auth"), wrapAsync(forgot));
router.route("/reset-password").post(wrapAsync(resetPassword));
router
  .route("/change-password")
  .post(auth(["user", "admin", "manager"]), wrapAsync(changePassword));
router.post("/google", wrapAsync(google));

export default router;
