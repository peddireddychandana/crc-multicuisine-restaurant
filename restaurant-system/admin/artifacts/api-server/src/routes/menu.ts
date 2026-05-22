import { Router, type IRouter } from "express";
import { db, menuItemsTable } from "@workspace/db";
import { eq, desc, ilike, sql } from "drizzle-orm";
import {
  GetMenuItemsQueryParams,
  GetMenuItemParams,
  UpdateMenuItemParams,
  UpdateMenuItemBody,
  DeleteMenuItemParams,
  CreateMenuItemBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapItem(item: typeof menuItemsTable.$inferSelect) {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? null,
    category: item.category,
    price: Number(item.price),
    foodType: item.foodType,
    isAvailable: item.isAvailable,
    isBestseller: item.isBestseller,
    rating: Number(item.rating),
    imageUrl: item.imageUrl ?? null,
    orderCount: item.orderCount ?? null,
  };
}

router.get("/menu", async (req, res): Promise<void> => {
  const parsed = GetMenuItemsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  let query = db.select().from(menuItemsTable).$dynamic();

  if (params.category) {
    query = query.where(eq(menuItemsTable.category, params.category)) as typeof query;
  }
  if (params.available !== undefined) {
    query = query.where(eq(menuItemsTable.isAvailable, params.available)) as typeof query;
  }
  if (params.search) {
    query = query.where(ilike(menuItemsTable.name, `%${params.search}%`)) as typeof query;
  }

  const items = await query.orderBy(desc(menuItemsTable.orderCount));
  res.json(items.map(mapItem));
});

router.get("/menu/top-dishes", async (_req, res): Promise<void> => {
  const items = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.isAvailable, true))
    .orderBy(desc(menuItemsTable.orderCount))
    .limit(10);

  res.json(items.map(mapItem));
});

router.get("/menu/categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select({
      name: menuItemsTable.category,
      count: sql<number>`count(*)::int`,
      availableCount: sql<number>`count(*) filter (where ${menuItemsTable.isAvailable} = true)::int`,
    })
    .from(menuItemsTable)
    .groupBy(menuItemsTable.category)
    .orderBy(menuItemsTable.category);

  res.json(categories);
});

router.get("/menu/:id", async (req, res): Promise<void> => {
  const params = GetMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, params.data.id));
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  res.json(mapItem(item));
});

router.post("/menu", async (req, res): Promise<void> => {
  const parsed = CreateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .insert(menuItemsTable)
    .values({
      ...parsed.data,
      price: String(parsed.data.price),
      rating: parsed.data.rating !== undefined ? String(parsed.data.rating) : "4.0",
      isAvailable: parsed.data.isAvailable ?? true,
      isBestseller: parsed.data.isBestseller ?? false,
    })
    .returning();

  res.status(201).json(mapItem(item));
});

router.patch("/menu/:id", async (req, res): Promise<void> => {
  const params = UpdateMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof menuItemsTable.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.price !== undefined) updateData.price = String(parsed.data.price);
  if (parsed.data.foodType !== undefined) updateData.foodType = parsed.data.foodType;
  if (parsed.data.isAvailable !== undefined) updateData.isAvailable = parsed.data.isAvailable;
  if (parsed.data.isBestseller !== undefined) updateData.isBestseller = parsed.data.isBestseller;
  if (parsed.data.rating !== undefined) updateData.rating = String(parsed.data.rating);
  if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl;

  const [item] = await db
    .update(menuItemsTable)
    .set(updateData)
    .where(eq(menuItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  res.json(mapItem(item));
});

router.delete("/menu/:id", async (req, res): Promise<void> => {
  const params = DeleteMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .delete(menuItemsTable)
    .where(eq(menuItemsTable.id, params.data.id))
    .returning();

  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
