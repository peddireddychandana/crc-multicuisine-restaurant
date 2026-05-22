import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITable extends Document {
  tableNumber: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  currentOrder?: Types.ObjectId;
  occupancy: number;
  capacity: number;
  reserved: boolean;
  createdAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    tableNumber: { type: Number, required: true, unique: true },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "cleaning"],
      default: "available",
    },
    currentOrder: { type: Schema.Types.ObjectId, ref: "Order" },
    occupancy: { type: Number, default: 0 },
    capacity: { type: Number, default: 4 },
    reserved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TableSchema.set("toJSON", {
  virtuals: true,
  transform: function (_doc, ret) {
    ret.id = parseInt(ret._id?.toString()?.slice(-8) || "0", 16) || 0;
    return ret;
  },
});

export default mongoose.model<ITable>("Table", TableSchema);
