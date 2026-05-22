import { Request, Response } from "express";
import User, { UserRole } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { sendError } from "../utils/responseHandler.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body as { name: string; email: string; password: string; role?: string };
  const existing = await User.findOne({ email });
  if (existing) { sendError(res, "Email already registered", 400); return; }
  const user = await User.create({ name, email, password, role: (role || "customer") as UserRole });
  const token = generateToken(user._id.toString(), user.role);
  const admin = { id: parseInt(user._id.toString().slice(-8), 16) || 0, email: user.email, name: user.name, role: user.role };
  res.status(201).json({ token, admin });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    sendError(res, "Invalid credentials", 401); return;
  }
  if (!user.isActive) { sendError(res, "Account deactivated", 401); return; }
  const token = generateToken(user._id.toString(), user.role);
  const admin = { id: parseInt(user._id.toString().slice(-8), 16) || 0, email: user.email, name: user.name, role: user.role };
  res.json({ token, admin });
}

export async function getMe(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user?.id).select("-password");
  if (!user) { sendError(res, "User not found", 404); return; }
  const admin = { id: parseInt(user._id.toString().slice(-8), 16) || 0, email: user.email, name: user.name, role: user.role };
  res.json(admin);
}
