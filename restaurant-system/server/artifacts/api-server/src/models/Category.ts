import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.set("toJSON", {
  virtuals: true,
  transform: function (_doc, ret) {
    ret.id = parseInt(ret._id?.toString()?.slice(-8) || "0", 16) || 0;
    return ret;
  },
});

export default mongoose.model<ICategory>("Category", CategorySchema);
