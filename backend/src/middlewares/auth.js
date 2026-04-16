import jwt from "jsonwebtoken";
import ExpressError from "../utils/expressError.js";

const auth = (allowRoles) => (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET;
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return next(
      new ExpressError(
        "Authentication failed: No token provided",
        401,
      ),
    );
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = decoded.payload;
    if (!allowRoles.includes(user.role)) {
      return next(new ExpressError("Access denied: Insufficient Permissions", 403));
    }

    req.user = user;
    next();
  } catch (error) {
    const message =
      error.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    return next(new ExpressError(message, 401));
  }
};

export default auth;
