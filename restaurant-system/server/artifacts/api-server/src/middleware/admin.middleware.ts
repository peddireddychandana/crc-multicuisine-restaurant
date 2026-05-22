import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";
import { sendError } from "../utils/responseHandler.js";

const ADMIN_ROLES = ["super_admin", "restaurant_manager", "staff"];

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || !ADMIN_ROLES.includes(req.user.role)) {
    sendError(res, "Admin access required", 403);
    return;
  }
  next();
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "super_admin") {
    sendError(res, "Super admin access required", 403);
    return;
  }
  next();
}
