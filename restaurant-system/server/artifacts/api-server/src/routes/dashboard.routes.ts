import mongoose from "mongoose";
import { Router } from "express";
import { getDashboard, getRevenue } from "../controllers/analytics.controller.js";
import Order from "../models/Order.js";
import Table from "../models/Table.js";
import Notification from "../models/Notification.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

const DEMO_ACTIVITY = [
  { id: 1, type: "order", message: "Order #1001 from Table 5 - completed", timestamp: new Date().toISOString(), status: "completed", tableNumber: 5 },
  { id: 2, type: "order", message: "Order #1002 from Table 3 - preparing", timestamp: new Date().toISOString(), status: "preparing", tableNumber: 3 },
  { id: 3, type: "order", message: "Order #1003 from Table 8 - pending", timestamp: new Date().toISOString(), status: "pending", tableNumber: 8 },
];

router.post("/reset", authenticate, requireAdmin, async (_req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json({ success: true, deletedOrders: 0, note: "MongoDB not connected, nothing to reset" });
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const [ordersResult] = await Promise.all([
      Order.deleteMany({ createdAt: { $gte: today, $lte: todayEnd } }),
      Table.updateMany({}, { status: "available", currentOrder: undefined, occupancy: 0 }),
      Notification.deleteMany({}),
    ]);
    res.json({ success: true, deletedOrders: ordersResult.deletedCount });
  } catch (err) {
    console.error("Reset error:", err);
    sendError(res, "Failed to reset dashboard", 500);
  }
});

router.get("/stats", authenticate, requireAdmin, getDashboard);

router.get("/revenue-chart", authenticate, requireAdmin, getRevenue);

router.get("/activity", authenticate, requireAdmin, async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    res.json(DEMO_ACTIVITY);
    return;
  }
  const orders = await Order.find().sort({ createdAt: -1 }).limit(10);
  const activity = orders.map((o) => ({
    id: parseInt(o._id.toString().slice(-8), 16) || 0,
    type: "order",
    message: `Order #${o.orderId} from Table ${o.tableNumber} - ${o.orderStatus}`,
    timestamp: o.createdAt,
    status: o.orderStatus,
    tableNumber: o.tableNumber,
  }));
  res.json(activity);
});

router.get("/peak-hours", authenticate, requireAdmin, async (_req, res) => {
  if (mongoose.connection.readyState !== 1) {
    res.json([]);
    return;
  }
  const peakData = await Order.aggregate([
    { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json(peakData.map((p) => ({ hour: p._id, orders: p.count })));
});

export default router;
