import { Router } from "express";
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead, deleteNotification } from "../controllers/notification.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/", authenticate, requireAdmin, getNotifications);
router.get("/unread-count", authenticate, requireAdmin, getUnreadCount);
router.patch("/:id/read", authenticate, requireAdmin, markNotificationRead);
router.post("/read-all", authenticate, requireAdmin, markAllNotificationsRead);
router.patch("/read-all", authenticate, requireAdmin, markAllNotificationsRead);
router.delete("/:id", authenticate, requireAdmin, deleteNotification);

export default router;
