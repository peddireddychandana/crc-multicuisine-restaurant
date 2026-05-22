import mongoose, { Document, Schema } from "mongoose";

export interface ISettings extends Document {
  restaurantName: string;
  openingTime: string;
  closingTime: string;
  taxRate: number;
  deliveryEnabled: boolean;
  deliveryRadius: number;
  minOrderAmount: number;
  contactPhone: string;
  contactEmail: string;
  address: string;
  qrEnabled: boolean;
  notificationsEnabled: boolean;
}

const SettingsSchema = new Schema<ISettings>(
  {
    restaurantName: { type: String, default: "CRC Multicuisine" },
    openingTime: { type: String, default: "10:00" },
    closingTime: { type: String, default: "23:00" },
    taxRate: { type: Number, default: 5 },
    deliveryEnabled: { type: Boolean, default: false },
    deliveryRadius: { type: Number, default: 10 },
    minOrderAmount: { type: Number, default: 200 },
    contactPhone: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    address: { type: String, default: "" },
    qrEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SettingsSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = 1;
    return ret;
  },
});

export default mongoose.model<ISettings>("Settings", SettingsSchema);
