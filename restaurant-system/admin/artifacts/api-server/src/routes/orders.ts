import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  GetOrdersQueryParams,
  GetOrderParams,
  UpdateOrderParams,
  UpdateOrderBody,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  CreateOrderBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    tableNumber: o.tableNumber,
    customerName: o.customerName ?? null,
    status: o.status,
    items: o.items as Array<{ menuItemId: number; name: string; quantity: number; price: number; notes?: string }>,
    totalAmount: Number(o.totalAmount),
    notes: o.notes ?? null,
    estimatedTime: o.estimatedTime ?? null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  const parsed = GetOrdersQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  let query = db.select().from(ordersTable).$dynamic();

  if (params.status) {
    query = query.where(eq(ordersTable.status, params.status)) as typeof query;
  }

  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;

  const [allOrders, [countResult]] = await Promise.all([
    query.orderBy(desc(ordersTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(ordersTable),
  ]);

  res.json({
    orders: allOrders.map(mapOrder),
    total: countResult?.count ?? 0,
  });
});

router.get("/orders/summary", async (_req, res): Promise<void> => {
  const [result] = await db
    .select({
      pending: sql<number>`count(*) filter (where ${ordersTable.status} = 'pending')::int`,
      accepted: sql<number>`count(*) filter (where ${ordersTable.status} = 'accepted')::int`,
      preparing: sql<number>`count(*) filter (where ${ordersTable.status} = 'preparing')::int`,
      cooking: sql<number>`count(*) filter (where ${ordersTable.status} = 'cooking')::int`,
      ready: sql<number>`count(*) filter (where ${ordersTable.status} = 'ready')::int`,
      served: sql<number>`count(*) filter (where ${ordersTable.status} = 'served')::int`,
      completed: sql<number>`count(*) filter (where ${ordersTable.status} = 'completed')::int`,
      rejected: sql<number>`count(*) filter (where ${ordersTable.status} = 'rejected')::int`,
    })
    .from(ordersTable);

  res.json(result ?? {
    pending: 0, accepted: 0, preparing: 0, cooking: 0,
    ready: 0, served: 0, completed: 0, rejected: 0,
  });
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(mapOrder(order));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tableNumber, customerName, items, notes } = parsed.data;
  const total = (items as Array<{ price: number; quantity: number }>).reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [order] = await db
    .insert(ordersTable)
    .values({
      tableNumber,
      customerName: customerName ?? null,
      items: items as typeof ordersTable.$inferInsert["items"],
      totalAmount: total.toFixed(2),
      notes: notes ?? null,
    })
    .returning();

  res.status(201).json(mapOrder(order));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof ordersTable.$inferInsert> = { updatedAt: new Date() };
  if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;
  if (parsed.data.estimatedTime !== undefined) updateData.estimatedTime = parsed.data.estimatedTime;
  if (parsed.data.customerName !== undefined) updateData.customerName = parsed.data.customerName;

  const [order] = await db
    .update(ordersTable)
    .set(updateData)
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(mapOrder(order));
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof ordersTable.$inferInsert> = {
    status: parsed.data.status,
    updatedAt: new Date(),
  };
  if (parsed.data.estimatedTime !== undefined) updateData.estimatedTime = parsed.data.estimatedTime;

  const [order] = await db
    .update(ordersTable)
    .set(updateData)
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(mapOrder(order));
});

export default router;
