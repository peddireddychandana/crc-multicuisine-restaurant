import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMenuItem extends Document {
  name: string;
  slug: string;
  description: string;
  category: Types.ObjectId;
  image: string;
  galleryImages: string[];
  price: number;
  ratings: number;
  totalReviews: number;
  isVeg: boolean;
  isBestseller: boolean;
  isAvailable: boolean;
  spicyLevel: "mild" | "medium" | "hot" | "extra_hot";
  preparationTime: number;
  ingredients: string[];
  calories?: number;
  tags: string[];
  createdAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    image: { type: String, default: "" },
    galleryImages: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isVeg: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    spicyLevel: {
      type: String,
      enum: ["mild", "medium", "hot", "extra_hot"],
      default: "medium",
    },
    preparationTime: { type: Number, default: 20 },
    ingredients: [{ type: String }],
    calories: { type: Number },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

MenuItemSchema.index({ name: "text", tags: "text", description: "text" });

MenuItemSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = parseInt(ret._id?.toString()?.slice(-8) || "0", 16) || 0;
    ret.foodType = ret.isVeg ? "veg" : "non-veg";
    ret.imageUrl = ret.image;
    ret.rating = ret.ratings;
    ret.categoryName = ret.category?.name || "";
    ret.categorySlug = ret.category?.slug || "";
    ret.categoryId = ret.category?._id?.toString() || ret.category?.toString() || "";
    const spiceMap: Record<string, number> = { mild: 1, medium: 2, hot: 3, extra_hot: 4 };
    ret.spiceLevel = spiceMap[ret.spicyLevel as string] || 0;
    return ret;
  },
});

export default mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
