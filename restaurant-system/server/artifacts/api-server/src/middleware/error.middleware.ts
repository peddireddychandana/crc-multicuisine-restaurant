import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export function errorMiddleware(err: Error & { statusCode?: number; errors?: unknown }, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ err }, "Unhandled error");
  const statusCode = err.statusCode || 500;
  const message = process.env["NODE_ENV"] === "production" ? "Something went wrong" : err.message;
  res.status(statusCode).json({ success: false, message, errors: err.errors });
}
