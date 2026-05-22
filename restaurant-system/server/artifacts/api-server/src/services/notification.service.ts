import Notification from "../models/Notification.js";
import { getIO } from "../config/socket.js";
import { logger } from "../lib/logger.js";

export async function createNotification(
  title: string,
  message: string,
  type: "order" | "review" | "offer" | "system",
  data?: Record<string, unknown>
) {
  try {
    const notification = await Notification.create({ title, message, type, data });
    const io = getIO();
    io.emit("live-notification", notification);
    return notification;
  } catch (err) {
    logger.error({ err }, "Failed to create notification");
  }
}
