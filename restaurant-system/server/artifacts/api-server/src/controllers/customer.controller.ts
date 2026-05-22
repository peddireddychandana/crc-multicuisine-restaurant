import { Request, Response } from "express";
import Order from "../models/Order.js";

export async function getCustomers(req: Request, res: Response) {
  const { search } = req.query;
  const matchStage: Record<string, unknown> = {};
  if (search) {
    matchStage["$or"] = [
      { customerName: { $regex: search, $options: "i" } },
      { customerEmail: { $regex: search, $options: "i" } },
      { customerPhone: { $regex: search, $options: "i" } },
    ];
  }

  const customers = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$customerEmail",
        name: { $first: "$customerName" },
        phone: { $first: "$customerPhone" },
        email: { $first: "$customerEmail" },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$finalAmount" },
        lastVisit: { $max: "$createdAt" },
      },
    },
    { $sort: { totalSpent: -1 } },
    {
      $project: {
        _id: 0,
        id: { $concat: [{ $toString: "$_id" }, "-", { $toString: "$totalOrders" }] },
        name: { $ifNull: ["$name", "Unknown"] },
        phone: { $ifNull: ["$phone", null] },
        email: { $ifNull: ["$_id", null] },
        totalOrders: 1,
        totalSpent: 1,
        lastVisit: 1,
      },
    },
  ]);

  res.json({ customers, total: customers.length });
}

export async function getTopCustomers(_req: Request, res: Response) {
  const customers = await Order.aggregate([
    {
      $group: {
        _id: "$customerEmail",
        name: { $first: "$customerName" },
        phone: { $first: "$customerPhone" },
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: "$finalAmount" },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        id: { $concat: [{ $toString: "$_id" }, "-", { $toString: "$totalOrders" }] },
        name: { $ifNull: ["$name", "Unknown"] },
        phone: { $ifNull: ["$phone", null] },
        totalOrders: 1,
        totalSpent: 1,
      },
    },
  ]);

  res.json(customers);
}
