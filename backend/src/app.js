import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
dotenv.config();
const app = express();
app.set("PORT", process.env.PORT || 5000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", userRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

app.use((error, req, res, next) => {
  console.error(error);
  const { statusCode, message, errors } = error;

  res.status(statusCode).json({
    success: false,
    error: message || "Internal Server Error",
    // errors: errors,
  });
});

export { app };
