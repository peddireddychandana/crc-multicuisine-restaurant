import { Request, Response } from "express";
import Notification from "../models/Notification.js";
import { sendError } from "../utils/responseHandler.js";

export async function getNotifications(_req: Request, res: Response) {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
  const result = notifications.map((n) => ({
    id: parseInt(n._id.toString().slice(-8), 16) || 0,
    type: mapNotificationType(n.type),
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    relatedId: n.data?.reviewId || n.data?.orderId || null,
    createdAt: n.createdAt,
  }));
  res.json(result);
}

export async function getUnreadCount(_req: Request, res: Response) {
  const count = await Notification.countDocuments({ isRead: false });
  res.json({ count });
}

async function findNotificationByVirtualId(virtualId: number) {
  const notifications = await Notification.find({}).limit(1000).lean();
  for (const n of notifications) {
    const vid = parseInt(n._id.toString().slice(-8), 16) || 0;
    if (vid === virtualId) return n._id;
  }
  return null;
}

async function resolveNotificationId(id: string) {
  const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);
  if (isObjectId) return id;
  if (/^\d+$/.test(id)) {
    const oid = await findNotificationByVirtualId(parseInt(id, 10));
    if (oid) return oid.toString();
  }
  return id;
}

export async function markNotificationRead(req: Request, res: Response) {
  const resolvedId = await resolveNotificationId(req.params["id"]);
  await Notification.findByIdAndUpdate(resolvedId, { isRead: true });
  res.json({ success: true });
}

export async function deleteNotification(req: Request, res: Response) {
  const resolvedId = await resolveNotificationId(req.params["id"]);
  const result = await Notification.findByIdAndDelete(resolvedId);
  if (!result) { sendError(res, "Notification not found", 404); return; }
  res.json({ success: true });
}

export async function markAllNotificationsRead(_req: Request, res: Response) {
  const result = await Notification.updateMany({ isRead: false }, { isRead: true });
  res.json({ updated: result.modifiedCount });
}

function mapNotificationType(type: string): string {
  const map: Record<string, string> = {
    order: "new_order",
    review: "new_review",
    offer: "offer_expired",
    system: "revenue_milestone",
  };
  return map[type] || "new_order";
}
