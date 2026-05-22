import { Router, type IRouter } from "express";
import { db, offersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  GetOffersQueryParams,
  UpdateOfferParams,
  UpdateOfferBody,
  DeleteOfferParams,
  CreateOfferBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapOffer(o: typeof offersTable.$inferSelect) {
  return {
    id: o.id,
    title: o.title,
    description: o.description ?? null,
    bannerUrl: o.bannerUrl ?? null,
    originalPrice: Number(o.originalPrice),
    discountedPrice: Number(o.discountedPrice),
    discountPercent: Number(o.discountPercent),
    badge: o.badge ?? null,
    category: o.category ?? null,
    startDate: o.startDate,
    endDate: o.endDate,
    isFeatured: o.isFeatured,
    isActive: o.isActive,
    createdAt: o.createdAt.toISOString(),
  };
}

router.get("/offers", async (req, res): Promise<void> => {
  const parsed = GetOffersQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  let query = db.select().from(offersTable).$dynamic();
  if (params.active !== undefined) {
    query = query.where(eq(offersTable.isActive, params.active)) as typeof query;
  }

  const offers = await query.orderBy(desc(offersTable.createdAt));
  res.json(offers.map(mapOffer));
});

router.post("/offers", async (req, res): Promise<void> => {
  const parsed = CreateOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [offer] = await db
    .insert(offersTable)
    .values({
      ...parsed.data,
      originalPrice: String(parsed.data.originalPrice),
      discountedPrice: String(parsed.data.discountedPrice),
      discountPercent: String(parsed.data.discountPercent),
      isFeatured: parsed.data.isFeatured ?? false,
      isActive: parsed.data.isActive ?? true,
    })
    .returning();

  res.status(201).json(mapOffer(offer));
});

router.patch("/offers/:id", async (req, res): Promise<void> => {
  const params = UpdateOfferParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof offersTable.$inferInsert> = {};
  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.bannerUrl !== undefined) updateData.bannerUrl = parsed.data.bannerUrl;
  if (parsed.data.originalPrice !== undefined) updateData.originalPrice = String(parsed.data.originalPrice);
  if (parsed.data.discountedPrice !== undefined) updateData.discountedPrice = String(parsed.data.discountedPrice);
  if (parsed.data.discountPercent !== undefined) updateData.discountPercent = String(parsed.data.discountPercent);
  if (parsed.data.badge !== undefined) updateData.badge = parsed.data.badge;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.startDate !== undefined) updateData.startDate = parsed.data.startDate;
  if (parsed.data.endDate !== undefined) updateData.endDate = parsed.data.endDate;
  if (parsed.data.isFeatured !== undefined) updateData.isFeatured = parsed.data.isFeatured;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

  const [offer] = await db
    .update(offersTable)
    .set(updateData)
    .where(eq(offersTable.id, params.data.id))
    .returning();

  if (!offer) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }

  res.json(mapOffer(offer));
});

router.delete("/offers/:id", async (req, res): Promise<void> => {
  const params = DeleteOfferParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [offer] = await db
    .delete(offersTable)
    .where(eq(offersTable.id, params.data.id))
    .returning();

  if (!offer) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
