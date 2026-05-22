import { Router, type IRouter } from "express";
import { db, restaurantSettingsTable } from "@workspace/db";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

function mapSettings(s: typeof restaurantSettingsTable.$inferSelect) {
  return {
    id: s.id,
    restaurantName: s.restaurantName,
    openingTime: s.openingTime,
    closingTime: s.closingTime,
    taxRate: Number(s.taxRate),
    deliveryEnabled: s.deliveryEnabled,
    deliveryRadius: s.deliveryRadius ? Number(s.deliveryRadius) : null,
    minOrderAmount: s.minOrderAmount ? Number(s.minOrderAmount) : null,
    contactPhone: s.contactPhone,
    contactEmail: s.contactEmail,
    address: s.address,
    qrEnabled: s.qrEnabled,
    notificationsEnabled: s.notificationsEnabled,
    updatedAt: s.updatedAt.toISOString(),
  };
}

router.get("/settings", async (_req, res): Promise<void> => {
  const [settings] = await db.select().from(restaurantSettingsTable).limit(1);

  if (!settings) {
    const [created] = await db.insert(restaurantSettingsTable).values({}).returning();
    res.json(mapSettings(created));
    return;
  }

  res.json(mapSettings(settings));
});

router.patch("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(restaurantSettingsTable).limit(1);

  const updateData: Partial<typeof restaurantSettingsTable.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (parsed.data.restaurantName !== undefined) updateData.restaurantName = parsed.data.restaurantName;
  if (parsed.data.openingTime !== undefined) updateData.openingTime = parsed.data.openingTime;
  if (parsed.data.closingTime !== undefined) updateData.closingTime = parsed.data.closingTime;
  if (parsed.data.taxRate !== undefined) updateData.taxRate = String(parsed.data.taxRate);
  if (parsed.data.deliveryEnabled !== undefined) updateData.deliveryEnabled = parsed.data.deliveryEnabled;
  if (parsed.data.deliveryRadius !== undefined) updateData.deliveryRadius = String(parsed.data.deliveryRadius);
  if (parsed.data.minOrderAmount !== undefined) updateData.minOrderAmount = String(parsed.data.minOrderAmount);
  if (parsed.data.contactPhone !== undefined) updateData.contactPhone = parsed.data.contactPhone;
  if (parsed.data.contactEmail !== undefined) updateData.contactEmail = parsed.data.contactEmail;
  if (parsed.data.address !== undefined) updateData.address = parsed.data.address;
  if (parsed.data.qrEnabled !== undefined) updateData.qrEnabled = parsed.data.qrEnabled;
  if (parsed.data.notificationsEnabled !== undefined) updateData.notificationsEnabled = parsed.data.notificationsEnabled;

  let result;
  if (!existing) {
    [result] = await db.insert(restaurantSettingsTable).values(updateData).returning();
  } else {
    [result] = await db.update(restaurantSettingsTable).set(updateData).returning();
  }

  res.json(mapSettings(result));
});

export default router;
