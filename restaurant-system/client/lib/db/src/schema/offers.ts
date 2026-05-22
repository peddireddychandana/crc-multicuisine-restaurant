import { pgTable, serial, text, boolean, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  offerType: text("offer_type").notNull().default("limited_time"),
  imageUrl: text("image_url"),
  discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  discountedPrice: numeric("discounted_price", { precision: 10, scale: 2 }),
  menuItemId: integer("menu_item_id"),
  isActive: boolean("is_active").notNull().default(true),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  badgeText: text("badge_text"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOfferSchema = createInsertSchema(offersTable).omit({ id: true, createdAt: true });
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type Offer = typeof offersTable.$inferSelect;
