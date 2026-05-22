import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  GetNotificationsQueryParams,
  MarkNotificationReadParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapNotification(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    relatedId: n.relatedId ?? null,
    createdAt: n.createdAt.toISOString(),
  };
}

router.get("/notifications", async (req, res): Promise<void> => {
  const parsed = GetNotificationsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  let query = db.select().from(notificationsTable).$dynamic();
  if (params.unreadOnly) {
    query = query.where(eq(notificationsTable.isRead, false)) as typeof query;
  }

  const limit = params.limit ?? 50;
  const notifications = await query.orderBy(desc(notificationsTable.createdAt)).limit(limit);
  res.json(notifications.map(mapNotification));
});

router.get("/notifications/unread-count", async (_req, res): Promise<void> => {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notificationsTable)
    .where(eq(notificationsTable.isRead, false));

  res.json({ count: result?.count ?? 0 });
});

router.patch("/notifications/read-all", async (_req, res): Promise<void> => {
  const result = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.isRead, false))
    .returning();

  res.json({ updated: result.length });
});

router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [notification] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, params.data.id))
    .returning();

  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  res.json(mapNotification(notification));
});

export default router;
