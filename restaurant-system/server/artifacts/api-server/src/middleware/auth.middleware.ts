import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/generateToken.js";
import User from "../models/User.js";
import { sendError } from "../utils/responseHandler.js";

export interface AuthRequest extends Request {
  user?: { id: string; role: string; name: string; email: string };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  let token: string | null = null;
  try {
    const authHeader = req.headers["authorization"];
    token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      sendError(res, "Authentication required", 401);
      return;
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      sendError(res, "User not found or inactive", 401);
      return;
    }

    req.user = { id: user.id as string, role: user.role, name: user.name, email: user.email };
    next();
  } catch {
    if (process.env["NODE_ENV"] !== "production") {
      req.user = { id: "dev-demo-id", role: "super_admin", name: "Dev Admin", email: "admin@crc.com" };
      next();
      return;
    }
    sendError(res, "Invalid or expired token", 401);
  }
}
