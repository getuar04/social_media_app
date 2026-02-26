import { verifyToken } from "../util/token.js";
import User from "../models/User.model.js";

/**
 * OptionalAuthMiddleware:
 * - If Authorization header exists and token is valid -> sets req.user
 * - If missing/invalid -> continues without req.user (no 401)
 */
export const OptionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return next();

    const token = parts[1];
    const decoded = verifyToken(token);
    if (!decoded?.id) return next();

    const user = await User.findById(decoded.id).select("_id role is_active");
    if (!user) return next();

    req.user = { id: user._id, role: user.role, is_active: user.is_active };
    return next();
  } catch (err) {
    return next();
  }
};
