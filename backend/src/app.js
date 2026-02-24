import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import planRoutes from "./routes/plan.routes.js";
import { stripeWebhook } from "./controllers/payment.controller.js";
import { User } from "./models/user.model.js";
import { Payment } from "./models/payment.model.js";
import { Subscription } from "./models/subscription.model.js";
import { SubscriptionPlan } from "./models/subscriptionPlan.model.js";
import wrapAsync from "./utils/wrapAsync.js";
dotenv.config();
const app = express();
app.set("PORT", process.env.PORT || 5000);

app.use(cors({ origin: [process.env.FRONTEND_URL], credentials: true }));
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  wrapAsync(stripeWebhook)                   
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", userRoutes);
app.use("/api/billing", paymentRoutes);
app.use("/api/billing", planRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

// Associations
User.hasMany(Payment, { foreignKey: "user_id", as: "payment" });
Payment.belongsTo(User, { foreignKey: "user_id", as: "user" });
Subscription.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Subscription, { foreignKey: "user_id", as: "subscriptions" });
Subscription.belongsTo(SubscriptionPlan, { foreignKey: "plan_id", as: "plan" });
SubscriptionPlan.hasMany(Subscription, {
  foreignKey: "plan_id",
  as: "subscriptions",
});

app.use((error, req, res, next) => {
  console.error(error);
  const { statusCode = 500, message, errors } = error;

  res.status(statusCode).json({
    success: false,
    error: message || "Internal Server Error",
    // errors: errors,
  });
});

export { app };
