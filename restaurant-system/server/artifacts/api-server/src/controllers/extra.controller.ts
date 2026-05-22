import { Request, Response } from "express";
import MenuItem from "../models/MenuItem.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Offer from "../models/Offer.js";
import Category from "../models/Category.js";

export async function getMenuCategories(_req: Request, res: Response) {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
  const items = await MenuItem.find({ isAvailable: true });
  const data = categories.map((c) => ({
    _id: c._id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    itemCount: items.filter((i) => i.category?.toString() === c._id.toString()).length,
    sortOrder: c.sortOrder,
  }));
  res.json(data);
}

export async function getMenuItemsList(req: Request, res: Response) {
  const { category, search, vegOnly, bestseller, isAvailable } = req.query;
  const filter: Record<string, unknown> = {};
  if (isAvailable === "true") filter["isAvailable"] = true;
  else if (isAvailable === "false") filter["isAvailable"] = false;
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) filter["category"] = cat._id;
  }
  if (vegOnly === "true") filter["isVeg"] = true;
  if (bestseller === "true") filter["isBestseller"] = true;
  if (search) filter["$text"] = { $search: search };
  const items = await MenuItem.find(filter).populate("category", "name slug");
  res.json(items);
}

export async function getMenuItemById(req: Request, res: Response) {
  const item = await MenuItem.findById(req.params["id"]).populate("category", "name slug");
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
}

export async function getFeaturedDishes(_req: Request, res: Response) {
  const items = await MenuItem.find({ isAvailable: true, isBestseller: true })
    .populate("category", "name slug")
    .limit(8);
  res.json(items);
}

export async function getPopularDishes(_req: Request, res: Response) {
  const items = await MenuItem.find({ isAvailable: true })
    .sort({ ratings: -1, totalReviews: -1 })
    .populate("category", "name slug")
    .limit(8);
  res.json(items);
}

export async function getReviewStats(_req: Request, res: Response) {
  const reviews = await Review.find({ isApproved: true });
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : 0;
  const ratingBreakdown: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  reviews.forEach((r) => { ratingBreakdown[String(Math.floor(r.rating))]++; });
  res.json({ averageRating, totalReviews, ratingBreakdown });
}

export async function getOrderStats(_req: Request, res: Response) {
  const [totalOrders, activeOrders, revenue, items] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: { $nin: ["completed", "cancelled"] } }),
    Order.aggregate([
      { $match: { orderStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$finalAmount" } } },
    ]),
    Order.aggregate([
      { $unwind: "$orderedItems" },
      { $group: { _id: "$orderedItems.menuItem", name: { $first: "$orderedItems.name" }, count: { $sum: "$orderedItems.quantity" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);
  const totalRevenue = revenue[0]?.total || 0;
  res.json({
    totalOrders,
    activeOrders,
    totalRevenue,
    avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders * 100) / 100 : 0,
    topItems: items,
  });
}

export async function getDishOfDay(_req: Request, res: Response) {
  const now = new Date();
  const offer = await Offer.findOne({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });
  if (offer) {
    res.json(offer);
  } else {
    const item = await MenuItem.findOne({ isAvailable: true, isBestseller: true })
      .populate("category", "name slug")
      .sort({ ratings: -1 });
    res.json(item);
  }
}

export async function getTopDishes(_req: Request, res: Response) {
  const items = await Order.aggregate([
    { $unwind: "$orderedItems" },
    { $group: { _id: "$orderedItems.menuItem", name: { $first: "$orderedItems.name" }, totalOrdered: { $sum: "$orderedItems.quantity" }, revenue: { $sum: { $multiply: ["$orderedItems.price", "$orderedItems.quantity"] } } } },
    { $sort: { totalOrdered: -1 } },
    { $limit: 10 },
  ]);
  res.json(items);
}

export async function getOrdersSummary(_req: Request, res: Response) {
  const [total, pending, accepted, preparing, cooking, ready, completed, cancelled] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: "pending" }),
    Order.countDocuments({ orderStatus: "accepted" }),
    Order.countDocuments({ orderStatus: "preparing" }),
    Order.countDocuments({ orderStatus: "cooking" }),
    Order.countDocuments({ orderStatus: "ready" }),
    Order.countDocuments({ orderStatus: "completed" }),
    Order.countDocuments({ orderStatus: "cancelled" }),
  ]);
  res.json({ total, pending, accepted, preparing, cooking, ready, completed, cancelled });
}
