import { Router, type IRouter } from "express";
import { eq, count, sum, avg, desc, ne } from "drizzle-orm";
import { db, ordersTable, menuItemsTable } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
  GetOrderStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/orders/stats", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({
      totalOrders: count(),
      totalRevenue: sum(ordersTable.total),
      avgOrderValue: avg(ordersTable.total),
    })
    .from(ordersTable);

  const [activeCount] = await db
    .select({ activeOrders: count() })
    .from(ordersTable)
    .where(
      ne(ordersTable.status, "completed")
    );

  res.json(
    GetOrderStatsResponse.parse({
      totalOrders: totals.totalOrders,
      activeOrders: activeCount.activeOrders,
      totalRevenue: totals.totalRevenue ? parseFloat(totals.totalRevenue) : 0,
      avgOrderValue: totals.avgOrderValue ? parseFloat(totals.avgOrderValue) : 0,
      topItems: [],
    })
  );
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tableNumber, customerName, customerPhone, items, cookingNotes } = parsed.data;

  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      const [menuItem] = await db
        .select()
        .from(menuItemsTable)
        .where(eq(menuItemsTable.id, item.menuItemId));

      const unitPrice = menuItem ? parseFloat(menuItem.price) : 0;
      return {
        menuItemId: item.menuItemId,
        name: menuItem?.name ?? "Unknown",
        quantity: item.quantity,
        unitPrice,
        notes: item.notes ?? null,
      };
    })
  );

  const subtotal = enrichedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + gst) * 100) / 100;

  const [order] = await db
    .insert(ordersTable)
    .values({
      tableNumber,
      customerName: customerName ?? null,
      customerPhone: customerPhone ?? null,
      status: "pending",
      items: enrichedItems,
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2),
      cookingNotes: cookingNotes ?? null,
      estimatedMinutes: 25,
    })
    .returning();

  // Increment order count for each item
  await Promise.all(
    items.map((item) =>
      db
        .update(menuItemsTable)
        .set({ orderCount: menuItemsTable.orderCount })
        .where(eq(menuItemsTable.id, item.menuItemId))
    )
  );

  res.status(201).json(
    GetOrderResponse.parse({
      ...order,
      subtotal: parseFloat(order.subtotal),
      gst: parseFloat(order.gst),
      total: parseFloat(order.total),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })
  );
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(
    GetOrderResponse.parse({
      ...order,
      subtotal: parseFloat(order.subtotal),
      gst: parseFloat(order.gst),
      total: parseFloat(order.total),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })
  );
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {
    status: parsed.data.status,
    updatedAt: new Date(),
  };
  if (parsed.data.estimatedMinutes !== undefined) {
    updateData.estimatedMinutes = parsed.data.estimatedMinutes;
  }

  const [order] = await db
    .update(ordersTable)
    .set(updateData)
    .where(eq(ordersTable.id, id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(
    UpdateOrderStatusResponse.parse({
      ...order,
      subtotal: parseFloat(order.subtotal),
      gst: parseFloat(order.gst),
      total: parseFloat(order.total),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })
  );
});

export default router;
