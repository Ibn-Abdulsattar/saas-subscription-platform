import { User } from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import crypto from "node:crypto";
import sendMail from "../services/sendMail.js";
import { Op } from "sequelize";
import wrapAsync from "../utils/wrapAsync.js";
import ExpressError from "../utils/expressError.js";
const isProd = process.env.NODE_ENV === "production";

export const register = async (req, res, next) => {
  const { username, email, password } = req.body;
  let user = await User.findOne({ where: { email } });

  if (user) {
    return next(new ExpressError("User already exists. Please sign in.", 400));
  } else {
    user = await User.create({
      username,
      email,
      password,
      avatar_url: "",
    });
  }

  const subject = "Account created on SaaS 🔐";

  const message = `Welcome to SaaS, ${user.username}! 🎉

We’re excited to have you join our community.
`;

  await sendMail(user.email, subject, message);

  res.status(201).json({
    message: "Account created successfully!",
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    where: { email: email },
    attributes: [
      "user_id",
      "username",
      "email",
      "avatar_url",
      "token",
      "role",
      "password",
    ],
  });

  if (!user || !user.password) {
    return next(new ExpressError("Invalid email or password", 401));
  }

  const match = await user.comparePassword(password);
  if (!match) {
    return next(new ExpressError("Invalid email or password", 401));
  }

  const token = generateToken(user);

  user.token = token;
  user.token_updated_at = new Date();
  await user.save();

  const userData = user.toJSON(); 
delete userData.password;

  res.cookie("token", user.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });

  res.status(200).json({
    message: "Login successful",
    user:userData,
  });
};

export const logout = async (req, res, next) => {
  const { user } = req;
  if (!user) {
    return next(new ExpressError("Not authenticated", 401));
  }

  user.token = null;
  user.token_updated_at = null;
  await user.save();

  res
    .clearCookie("token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    })
    .status(200)
    .json({ message: "Logout successful" });
};

export const forgot = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return next(new ExpressError("User with this email does not exist", 404));
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const expireDate = new Date(Date.now() + 10 * 60 * 1000);

  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpires = expireDate;
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const subject = "Password Reset Request";
  const text = `Click the following link to reset your password: ${resetLink}`;

  await sendMail(user.email, subject, text);
  res.status(200).json({ message: "Password reset email sent" });
};

export const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    where: {
      resetPasswordToken: resetPasswordToken,
      resetPasswordExpires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    return next(new ExpressError("Token is invalid or has expired", 400));
  }
  user.password = password;
  user.resetPasswordToken = null;
  await user.save();
  res.status(200).json({ message: "Password reset successfully" });
};

export const clearUserTokens = wrapAsync(async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const [affectedCount] = await User.update(
    { token: null, token_updated_at: null },
    {
      where: {
        token_updated_at: { [Op.lt]: thirtyMinutesAgo },
      },
    },
  );

  console.log(`Cleared tokens for ${affectedCount} users.`);
});

export const profile = async (req, res, next    ) => {
  const { user } = req;
  const userData = User.findByPk(user.user_id, {
    attributes: ["user_id", "username", "email", "avatar_url", "role"],
  });

    res.status(200).json({ user: userData });
};
