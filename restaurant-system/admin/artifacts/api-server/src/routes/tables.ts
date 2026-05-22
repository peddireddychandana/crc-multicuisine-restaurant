import { Router, type IRouter } from "express";
import { db, restaurantTablesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { UpdateTableParams, UpdateTableBody } from "@workspace/api-zod";

const router: IRouter = Router();

function mapTable(t: typeof restaurantTablesTable.$inferSelect) {
  return {
    id: t.id,
    tableNumber: t.tableNumber,
    capacity: t.capacity,
    status: t.status,
    currentOrderId: t.currentOrderId ?? null,
    customerName: t.customerName ?? null,
    occupiedSince: t.occupiedSince ? t.occupiedSince.toISOString() : null,
  };
}

router.get("/tables", async (_req, res): Promise<void> => {
  const tables = await db
    .select()
    .from(restaurantTablesTable)
    .orderBy(restaurantTablesTable.tableNumber);

  res.json(tables.map(mapTable));
});

router.get("/tables/occupancy", async (_req, res): Promise<void> => {
  const [stats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      occupied: sql<number>`count(*) filter (where ${restaurantTablesTable.status} = 'occupied')::int`,
      available: sql<number>`count(*) filter (where ${restaurantTablesTable.status} = 'available')::int`,
      reserved: sql<number>`count(*) filter (where ${restaurantTablesTable.status} = 'reserved')::int`,
      cleaning: sql<number>`count(*) filter (where ${restaurantTablesTable.status} = 'cleaning')::int`,
    })
    .from(restaurantTablesTable);

  res.json({
    total: stats?.total ?? 0,
    occupied: stats?.occupied ?? 0,
    available: stats?.available ?? 0,
    reserved: stats?.reserved ?? 0,
    cleaning: stats?.cleaning ?? 0,
  });
});

router.patch("/tables/:id", async (req, res): Promise<void> => {
  const params = UpdateTableParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTableBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof restaurantTablesTable.$inferInsert> = {
    status: parsed.data.status,
  };

  if (parsed.data.customerName !== undefined) updateData.customerName = parsed.data.customerName;
  if (parsed.data.currentOrderId !== undefined) updateData.currentOrderId = parsed.data.currentOrderId;
  if (parsed.data.status === "occupied") {
    updateData.occupiedSince = new Date();
  } else if (parsed.data.status === "available") {
    updateData.occupiedSince = null;
    updateData.customerName = null;
    updateData.currentOrderId = null;
  }

  const [table] = await db
    .update(restaurantTablesTable)
    .set(updateData)
    .where(eq(restaurantTablesTable.id, params.data.id))
    .returning();

  if (!table) {
    res.status(404).json({ error: "Table not found" });
    return;
  }

  res.json(mapTable(table));
});

export default router;
