import mongoose, { Document, Schema, Types } from "mongoose";

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "cooking"
  | "ready"
  | "served"
  | "completed"
  | "cancelled"
  | "rejected";

export interface IOrderItem {
  menuItem: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrder extends Document {
  orderId: string;
  customerName: string;
  customerPhone?: string;
  tableNumber: number;
  orderedItems: IOrderItem[];
  totalAmount: number;
  gst: number;
  finalAmount: number;
  notes?: string;
  orderStatus: OrderStatus;
  estimatedCookingTime: number;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  menuItem: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String },
    tableNumber: { type: Number, required: true },
    orderedItems: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    gst: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    notes: { type: String },
    orderStatus: {
      type: String,
      enum: ["pending", "accepted", "preparing", "cooking", "ready", "served", "completed", "cancelled", "rejected"],
      default: "pending",
    },
    estimatedCookingTime: { type: Number, default: 25 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

OrderSchema.index({ orderStatus: 1, createdAt: -1 });

OrderSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = parseInt(ret._id?.toString()?.slice(-8) || "0", 16) || 0;
    ret.status = ret.orderStatus || "pending";
    ret.items = ret.orderedItems || [];
    ret.subtotal = ret.totalAmount ?? 0;
    ret.total = ret.finalAmount ?? 0;
    if (Array.isArray(ret.items)) {
      ret.items.forEach((item: Record<string, unknown>) => {
        item.menuItemId = item.menuItem;
        item.unitPrice = item.price ?? 0;
      });
    }
    return ret;
  },
});

export default mongoose.model<IOrder>("Order", OrderSchema);
