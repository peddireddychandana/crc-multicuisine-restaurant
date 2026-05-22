import { Router, type IRouter } from "express";
import { eq, ilike, and, desc, sql } from "drizzle-orm";
import { db, menuCategoriesTable, menuItemsTable } from "@workspace/db";
import {
  GetMenuItemsQueryParams,
  GetMenuItemParams,
  GetMenuItemResponse,
  GetMenuCategoriesResponse,
  GetMenuItemsResponse,
  GetFeaturedDishesResponse,
  GetPopularDishesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/menu/categories", async (_req, res): Promise<void> => {
  const categories = await db
    .select({
      id: menuCategoriesTable.id,
      name: menuCategoriesTable.name,
      slug: menuCategoriesTable.slug,
      description: menuCategoriesTable.description,
      imageUrl: menuCategoriesTable.imageUrl,
      sortOrder: menuCategoriesTable.sortOrder,
      itemCount: sql<number>`(select count(*) from menu_items where category_id = ${menuCategoriesTable.id} and is_available = true)::int`,
    })
    .from(menuCategoriesTable)
    .orderBy(menuCategoriesTable.sortOrder);

  res.json(GetMenuCategoriesResponse.parse(categories));
});

router.get("/menu/items", async (req, res): Promise<void> => {
  const query = GetMenuItemsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { category, search, vegOnly, bestseller } = query.data;

  const conditions = [eq(menuItemsTable.isAvailable, true)];

  if (category) {
    conditions.push(eq(menuItemsTable.categorySlug, category));
  }
  if (search) {
    conditions.push(ilike(menuItemsTable.name, `%${search}%`));
  }
  if (vegOnly) {
    conditions.push(eq(menuItemsTable.isVeg, true));
  }
  if (bestseller) {
    conditions.push(eq(menuItemsTable.isBestseller, true));
  }

  const items = await db
    .select()
    .from(menuItemsTable)
    .where(and(...conditions))
    .orderBy(menuItemsTable.categoryId, menuItemsTable.name);

  const mapped = items.map((item) => ({
    ...item,
    price: parseFloat(item.price),
    originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : null,
    rating: item.rating ? parseFloat(item.rating) : null,
  }));

  res.json(GetMenuItemsResponse.parse(mapped));
});

router.get("/menu/featured", async (_req, res): Promise<void> => {
  const items = await db
    .select()
    .from(menuItemsTable)
    .where(and(eq(menuItemsTable.isBestseller, true), eq(menuItemsTable.isAvailable, true)))
    .orderBy(desc(menuItemsTable.orderCount))
    .limit(8);

  const mapped = items.map((item) => ({
    ...item,
    price: parseFloat(item.price),
    originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : null,
    rating: item.rating ? parseFloat(item.rating) : null,
  }));

  res.json(GetFeaturedDishesResponse.parse(mapped));
});

router.get("/menu/popular", async (_req, res): Promise<void> => {
  const items = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.isAvailable, true))
    .orderBy(desc(menuItemsTable.orderCount))
    .limit(6);

  const mapped = items.map((item) => ({
    ...item,
    price: parseFloat(item.price),
    originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : null,
    rating: item.rating ? parseFloat(item.rating) : null,
  }));

  res.json(GetPopularDishesResponse.parse(mapped));
});

router.get("/menu/items/:id", async (req, res): Promise<void> => {
  const params = GetMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [item] = await db
    .select()
    .from(menuItemsTable)
    .where(eq(menuItemsTable.id, params.data.id));

  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  res.json(
    GetMenuItemResponse.parse({
      ...item,
      price: parseFloat(item.price),
      originalPrice: item.originalPrice ? parseFloat(item.originalPrice) : null,
      rating: item.rating ? parseFloat(item.rating) : null,
    })
  );
});

export default router;
