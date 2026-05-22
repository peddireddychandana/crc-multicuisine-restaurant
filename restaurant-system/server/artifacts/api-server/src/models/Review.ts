import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
  customerName: string;
  menuItem: Types.ObjectId;
  rating: number;
  reviewText: string;
  reviewImages: string[];
  isApproved: boolean;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    customerName: { type: String, default: "", trim: true },
    menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewText: { type: String, default: "", trim: true },
    reviewImages: [{ type: String }],
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ReviewSchema.set("toJSON", {
  virtuals: true,
  transform: function (_doc, ret) {
    ret.id = parseInt(ret._id?.toString()?.slice(-8) || "0", 16) || 0;
    ret.comment = ret.reviewText;
    ret.isVisible = ret.isApproved;
    return ret;
  },
});

export default mongoose.model<IReview>("Review", ReviewSchema);
