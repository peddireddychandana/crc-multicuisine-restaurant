import { pgTable, serial, text, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const restaurantSettingsTable = pgTable("restaurant_settings", {
  id: serial("id").primaryKey(),
  restaurantName: text("restaurant_name").notNull().default("CRC Multicuisine Restaurant"),
  openingTime: text("opening_time").notNull().default("09:00"),
  closingTime: text("closing_time").notNull().default("23:00"),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("5.0"),
  deliveryEnabled: boolean("delivery_enabled").notNull().default(true),
  deliveryRadius: numeric("delivery_radius", { precision: 5, scale: 2 }),
  minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }),
  contactPhone: text("contact_phone").notNull().default("+91 98765 43210"),
  contactEmail: text("contact_email").notNull().default("admin@crcrestaurant.com"),
  address: text("address").notNull().default("123 Fine Dining Street, Mumbai, Maharashtra 400001"),
  qrEnabled: boolean("qr_enabled").notNull().default(true),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRestaurantSettingsSchema = createInsertSchema(restaurantSettingsTable).omit({ id: true, updatedAt: true });
export type InsertRestaurantSettings = z.infer<typeof insertRestaurantSettingsSchema>;
export type RestaurantSettings = typeof restaurantSettingsTable.$inferSelect;
