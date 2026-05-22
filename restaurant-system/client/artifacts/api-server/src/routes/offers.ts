import { Router, type IRouter } from "express";
import { eq, and, gte, lte, or, isNull } from "drizzle-orm";
import { db, offersTable } from "@workspace/db";
import {
  GetOffersResponse,
  CreateOfferBody,
  UpdateOfferParams,
  UpdateOfferBody,
  UpdateOfferResponse,
  DeleteOfferParams,
  GetDishOfDayResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/offers", async (_req, res): Promise<void> => {
  const now = new Date();

  const offers = await db
    .select()
    .from(offersTable)
    .where(
      and(
        eq(offersTable.isActive, true),
        or(isNull(offersTable.expiresAt), gte(offersTable.expiresAt, now))
      )
    )
    .orderBy(offersTable.createdAt);

  const mapped = offers.map((o) => ({
    ...o,
    discountPercent: o.discountPercent ? parseFloat(o.discountPercent) : null,
    originalPrice: o.originalPrice ? parseFloat(o.originalPrice) : null,
    discountedPrice: o.discountedPrice ? parseFloat(o.discountedPrice) : null,
    startsAt: o.startsAt ? o.startsAt.toISOString() : null,
    expiresAt: o.expiresAt ? o.expiresAt.toISOString() : null,
    createdAt: o.createdAt.toISOString(),
  }));

  res.json(GetOffersResponse.parse(mapped));
});

router.get("/offers/dish-of-day", async (_req, res): Promise<void> => {
  const now = new Date();

  const [offer] = await db
    .select()
    .from(offersTable)
    .where(
      and(
        eq(offersTable.isActive, true),
        eq(offersTable.offerType, "dish_of_day"),
        or(isNull(offersTable.expiresAt), gte(offersTable.expiresAt, now))
      )
    )
    .limit(1);

  if (!offer) {
    res.status(404).json({ error: "No dish of the day found" });
    return;
  }

  res.json(
    GetDishOfDayResponse.parse({
      ...offer,
      discountPercent: offer.discountPercent ? parseFloat(offer.discountPercent) : null,
      originalPrice: offer.originalPrice ? parseFloat(offer.originalPrice) : null,
      discountedPrice: offer.discountedPrice ? parseFloat(offer.discountedPrice) : null,
      startsAt: offer.startsAt ? offer.startsAt.toISOString() : null,
      expiresAt: offer.expiresAt ? offer.expiresAt.toISOString() : null,
      createdAt: offer.createdAt.toISOString(),
    })
  );
});

router.post("/offers", async (req, res): Promise<void> => {
  const parsed = CreateOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const [offer] = await db
    .insert(offersTable)
    .values({
      title: data.title,
      description: data.description,
      offerType: data.offerType ?? "limited_time",
      imageUrl: data.imageUrl,
      discountPercent: data.discountPercent?.toString(),
      originalPrice: data.originalPrice?.toString(),
      discountedPrice: data.discountedPrice?.toString(),
      menuItemId: data.menuItemId,
      isActive: data.isActive ?? true,
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      badgeText: data.badgeText,
    })
    .returning();

  res.status(201).json({
    ...offer,
    discountPercent: offer.discountPercent ? parseFloat(offer.discountPercent) : null,
    originalPrice: offer.originalPrice ? parseFloat(offer.originalPrice) : null,
    discountedPrice: offer.discountedPrice ? parseFloat(offer.discountedPrice) : null,
    startsAt: offer.startsAt ? offer.startsAt.toISOString() : null,
    expiresAt: offer.expiresAt ? offer.expiresAt.toISOString() : null,
    createdAt: offer.createdAt.toISOString(),
  });
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

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.offerType !== undefined) updateData.offerType = data.offerType;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent?.toString();
  if (data.originalPrice !== undefined) updateData.originalPrice = data.originalPrice?.toString();
  if (data.discountedPrice !== undefined) updateData.discountedPrice = data.discountedPrice?.toString();
  if (data.menuItemId !== undefined) updateData.menuItemId = data.menuItemId;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.startsAt !== undefined) updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  if (data.badgeText !== undefined) updateData.badgeText = data.badgeText;

  const [offer] = await db
    .update(offersTable)
    .set(updateData)
    .where(eq(offersTable.id, params.data.id))
    .returning();

  if (!offer) {
    res.status(404).json({ error: "Offer not found" });
    return;
  }

  res.json(
    UpdateOfferResponse.parse({
      ...offer,
      discountPercent: offer.discountPercent ? parseFloat(offer.discountPercent) : null,
      originalPrice: offer.originalPrice ? parseFloat(offer.originalPrice) : null,
      discountedPrice: offer.discountedPrice ? parseFloat(offer.discountedPrice) : null,
      startsAt: offer.startsAt ? offer.startsAt.toISOString() : null,
      expiresAt: offer.expiresAt ? offer.expiresAt.toISOString() : null,
      createdAt: offer.createdAt.toISOString(),
    })
  );
});

router.delete("/offers/:id", async (req, res): Promise<void> => {
  const params = DeleteOfferParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(offersTable).where(eq(offersTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
