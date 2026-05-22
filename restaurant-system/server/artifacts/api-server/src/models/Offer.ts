import mongoose, { Document, Schema } from "mongoose";

export interface IOffer extends Document {
  title: string;
  description: string;
  bannerImage: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  isFeatured: boolean;
  isActive: boolean;
  badge?: string;
  category?: string;
  createdAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    bannerImage: { type: String, default: "" },
    originalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    badge: { type: String, default: "" },
    category: { type: String, default: "" },
  },
  { timestamps: true }
);

OfferSchema.set("toJSON", {
  virtuals: true,
  transform: function (_doc, ret) {
    ret.id = parseInt(ret._id?.toString()?.slice(-8) || "0", 16) || 0;
    ret.offerType = ret.isFeatured ? "featured" : "limited_time";
    ret.imageUrl = ret.bannerImage;
    ret.bannerUrl = ret.bannerImage;
    return ret;
  },
});

export default mongoose.model<IOffer>("Offer", OfferSchema);
