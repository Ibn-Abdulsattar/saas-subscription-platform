import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import searchRoutes from "./routes/search.routes.js";
import planRoutes from "./routes/plan.routes.js";
import projectRoutes from "./routes/project.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import activityRoutes from "./routes/activity.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"
import graphicalChartRoutes from "./routes/graphicalChart.routes.js"
import { stripeWebhook } from "./controllers/payment.controller.js";
import { User } from "./models/user.model.js";
import { Payment } from "./models/payment.model.js";
import { Subscription } from "./models/subscription.model.js";
import { SubscriptionPlan } from "./models/subscriptionPlan.model.js";
import wrapAsync from "./utils/wrapAsync.js";
import { Project } from "./models/project.model.js";
import { Task } from "./models/task.model.js";
import { Activity } from "./models/activity.model.js";
import {v2 as cloudinary} from "cloudinary";
dotenv.config();
const app = express();
app.set("PORT", process.env.PORT || 5000);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true 
});

app.use(cors({ origin: [process.env.FRONTEND_URL], credentials: true }));
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  wrapAsync(stripeWebhook),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/billing", paymentRoutes);
app.use("/api/billing", planRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/charts", graphicalChartRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/search", searchRoutes);
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
User.hasMany(Project, { foreignKey: "user_id", as: "projects" });
Project.belongsTo(User, { foreignKey: "user_id", as: "user" });
Project.hasMany(Task, {
  foreignKey: "project_id",
  as: "tasks",
  onDelete: "CASCADE",
});
Task.belongsTo(Project, { foreignKey: "project_id", as: "project" });
User.hasMany(Activity, { foreignKey: "user_id", as: "activities" });
Activity.belongsTo(User, { foreignKey: "user_id", as: "user" });


app.use((error, req, res, next) => {
  console.error(error);
  const { statusCode = 500, message, errors } = error;

  res.status(statusCode).json({
    success: false,
    error: message || "Internal Server Error",
    errors: errors,
  });
});

export { app };
