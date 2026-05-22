import mongoose from "mongoose";
import { Request, Response } from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import MenuItem from "../models/MenuItem.js";
import { getDashboardStats } from "../services/analytics.service.js";
import { sendSuccess } from "../utils/responseHandler.js";

const getPeriodStart = (period: string) => {
  const now = new Date();
  if (period === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

export async function getDashboard(_req: Request, res: Response) {
  const stats = await getDashboardStats();
  res.json(stats);
}

export async function getAnalyticsOverview(req: Request, res: Response) {
  const period = (req.query["period"] as string) || "week";
  const startDate = getPeriodStart(period);
  const prevStartDate = getPeriodStart(period === "today" ? "week" : period);

  const [currentData, prevData, totalCustomers, avgOrderValueResult] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, orderStatus: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$finalAmount" }, orders: { $sum: 1 }, customers: { $addToSet: "$customerId" } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: prevStartDate, $lt: startDate }, orderStatus: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$finalAmount" }, orders: { $sum: 1 } } },
    ]),
    User.countDocuments({ role: "customer" }),
    Order.aggregate([
      { $match: { orderStatus: "completed" } },
      { $group: { _id: null, avgValue: { $avg: "$finalAmount" } } },
    ]),
  ]);

  const current = currentData[0] || { revenue: 0, orders: 0, customers: [] };
  const previous = prevData[0] || { revenue: 0, orders: 0 };
  const revenueChange = previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0;
  const ordersChange = previous.orders > 0 ? ((current.orders - previous.orders) / previous.orders) * 100 : 0;

  res.json({
    revenue: current.revenue,
    orders: current.orders,
    customers: totalCustomers,
    avgOrderValue: Math.round((avgOrderValueResult[0]?.avgValue || 0) * 100) / 100,
    revenueChange: Math.round(revenueChange * 10) / 10,
    ordersChange: Math.round(ordersChange * 10) / 10,
  });
}

export async function getSalesByCategory(_req: Request, res: Response) {
  const sales = await Order.aggregate([
    { $match: { orderStatus: "completed" } },
    { $unwind: "$orderedItems" },
    { $group: { _id: "$orderedItems.category", revenue: { $sum: { $multiply: ["$orderedItems.price", "$orderedItems.quantity"] } }, orders: { $sum: "$orderedItems.quantity" } } },
    { $sort: { revenue: -1 } },
  ]);
  const totalRevenue = sales.reduce((sum: number, s: { revenue: number }) => sum + s.revenue, 0) || 1;
  res.json(
    sales.map((s: { _id: string; revenue: number; orders: number }) => ({
      category: s._id,
      revenue: s.revenue,
      orders: s.orders,
      percentage: Math.round((s.revenue / totalRevenue) * 100 * 10) / 10,
    }))
  );
}

export async function getTopSellingDishes(req: Request, res: Response) {
  const limit = parseInt(req.query["limit"] as string) || 10;
  const dishes = await Order.aggregate([
    { $unwind: "$orderedItems" },
    {
      $group: {
        _id: "$orderedItems.menuItem",
        name: { $first: "$orderedItems.name" },
        category: { $first: "$orderedItems.category" },
        orderCount: { $sum: "$orderedItems.quantity" },
        revenue: { $sum: { $multiply: ["$orderedItems.price", "$orderedItems.quantity"] } },
      },
    },
    { $sort: { orderCount: -1 } },
    { $limit: limit },
  ]);
  const items = await MenuItem.find({}).select("rating imageUrl");
  const itemMap: Record<string, { rating?: number; imageUrl?: string }> = {};
  for (const item of items) {
    itemMap[item.name] = { rating: item.rating, imageUrl: item.imageUrl };
  }
  res.json(
    dishes.map((d: { _id: string; name: string; category: string; orderCount: number; revenue: number }, i: number) => ({
      menuItemId: i + 1,
      name: d.name,
      category: d.category || "General",
      orderCount: d.orderCount,
      revenue: d.revenue,
      rating: itemMap[d.name]?.rating || 0,
      imageUrl: itemMap[d.name]?.imageUrl || null,
    }))
  );
}

const DEMO_REVENUE = [
  { _id: "2026-W01", total: 45000, orders: 12 },
  { _id: "2026-W02", total: 52000, orders: 15 },
  { _id: "2026-W03", total: 38000, orders: 10 },
  { _id: "2026-W04", total: 61000, orders: 18 },
  { _id: "2026-W05", total: 48000, orders: 14 },
  { _id: "2026-W06", total: 55000, orders: 16 },
  { _id: "2026-W07", total: 42000, orders: 11 },
  { _id: "2026-W08", total: 59000, orders: 17 },
  { _id: "2026-W09", total: 63000, orders: 19 },
  { _id: "2026-W10", total: 47000, orders: 13 },
  { _id: "2026-W11", total: 51000, orders: 15 },
  { _id: "2026-W12", total: 58000, orders: 16 },
];

export async function getRevenue(req: Request, res: Response) {
  if (mongoose.connection.readyState !== 1) {
    res.json(DEMO_REVENUE);
    return;
  }
  const { period = "monthly" } = req.query;
  const now = new Date();
  let startDate: Date;
  let groupBy: string;

  if (period === "daily") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    groupBy = "%Y-%m-%d";
  } else if (period === "weekly") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    groupBy = "%Y-W%V";
  } else {
    startDate = new Date(now.getFullYear() - 1, 0, 1);
    groupBy = "%Y-%m";
  }

  const revenue = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, orderStatus: "completed" } },
    { $group: { _id: { $dateToString: { format: groupBy, date: "$createdAt" } }, total: { $sum: "$finalAmount" }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  res.json(revenue);
}

export async function getOrdersAnalytics(_req: Request, res: Response) {
  const statusBreakdown = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);
  res.json({ statusBreakdown });
}

export async function getTopDishes(_req: Request, res: Response) {
  const topDishes = await Order.aggregate([
    { $unwind: "$orderedItems" },
    { $group: { _id: "$orderedItems.menuItem", name: { $first: "$orderedItems.name" }, totalOrdered: { $sum: "$orderedItems.quantity" }, revenue: { $sum: { $multiply: ["$orderedItems.price", "$orderedItems.quantity"] } } } },
    { $sort: { totalOrdered: -1 } },
    { $limit: 10 },
  ]);
  res.json(topDishes);
}

export async function getNotificationController(_req: Request, res: Response) {
  const notifications = await import("../models/Notification.js").then((m) => m.default.find().sort({ createdAt: -1 }).limit(50));
  res.json(notifications);
}

export async function markNotificationRead(req: Request, res: Response) {
  const { default: Notification } = await import("../models/Notification.js");
  await Notification.findByIdAndUpdate(req.params["id"], { isRead: true });
  res.json({ success: true });
}
