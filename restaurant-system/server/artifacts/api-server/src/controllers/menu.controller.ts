import { Request, Response } from "express";
import mongoose from "mongoose";
import MenuItem from "../models/MenuItem.js";
import Category from "../models/Category.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

async function findMenuItem(id: string) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return MenuItem.findById(id);
  }
  const num = parseInt(id, 10);
  if (!isNaN(num) && num > 0) {
    const hexSuffix = num.toString(16).toLowerCase().padStart(8, "0");
    return MenuItem.findOne({
      $expr: {
        $eq: [{ $substrCP: [{ $toString: "$_id" }, 16, 8] }, hexSuffix],
      },
    });
  }
  return MenuItem.findById(id);
}

export async function getMenuItems(req: Request, res: Response) {
  try {
    const { category, search, isVeg, isBestseller, isAvailable } = req.query;
    const filter: Record<string, unknown> = {};
    if (category) filter["category"] = category;
    if (isVeg === "true") filter["isVeg"] = true;
    if (isBestseller === "true") filter["isBestseller"] = true;
    if (isAvailable === "true") filter["isAvailable"] = true;
    else if (isAvailable === "false") filter["isAvailable"] = false;
    if (search) filter["$text"] = { $search: search };
    const items = await MenuItem.find(filter).populate("category", "name slug").sort({ createdAt: -1 });
    const result = items.map((item) => {
      const obj = item.toJSON();
      return { ...obj, category: typeof obj.category === "object" && obj.category ? obj.category.name || "" : obj.category || "" };
    });
    res.json(result);
  } catch (err) {
    console.error("getMenuItems error:", err);
    sendError(res, "Failed to fetch menu items", 500);
  }
}

export async function getMenuItem(req: Request, res: Response) {
  try {
    const item = await findMenuItem(req.params["id"]!).populate("category");
    if (!item) { sendError(res, "Menu item not found", 404); return; }
    res.json(item);
  } catch (err) {
    console.error("getMenuItem error:", err);
    sendError(res, "Failed to fetch menu item", 500);
  }
}

async function resolveCategory(data: Record<string, unknown>) {
  if (!data["category"]) return;

  if (typeof data["category"] === "string" && data["category"].length === 24) {
    return;
  }

  if (typeof data["category"] === "string") {
    const cat = await Category.findOne({ name: { $regex: new RegExp(`^${data["category"]}$`, "i") } });
    if (cat) {
      data["category"] = cat._id;
      return;
    }

    const created = await Category.create({ name: data["category"], slug: slugify(data["category"] as string) });
    data["category"] = created._id;
  }
}

export async function createMenuItem(req: Request, res: Response) {
  try {
    const data = mapFormFields(req.body as Record<string, unknown>);
    data["slug"] = slugify(data["name"] as string);
    await resolveCategory(data);
    const item = await MenuItem.create(data);
    res.status(201).json(item);
  } catch (err) {
    console.error("createMenuItem error:", err);
    sendError(res, "Failed to create menu item", 500);
  }
}

function mapFormFields(data: Record<string, unknown>) {
  if (data["imageUrl"] !== undefined) {
    data["image"] = data["imageUrl"];
    delete data["imageUrl"];
  }
  if (data["foodType"] === "veg") {
    data["isVeg"] = true;
  } else if (data["foodType"] === "non-veg") {
    data["isVeg"] = false;
  }
  delete data["foodType"];
  return data;
}

export async function updateMenuItem(req: Request, res: Response) {
  try {
    const data = mapFormFields(req.body as Record<string, unknown>);
    await resolveCategory(data);
    const item = await findMenuItem(req.params["id"]!);
    if (!item) { sendError(res, "Menu item not found", 404); return; }
    Object.assign(item, data);
    await item.save();
    res.json(item);
  } catch (err) {
    console.error("updateMenuItem error:", err);
    sendError(res, "Failed to update menu item", 500);
  }
}

export async function deleteMenuItem(req: Request, res: Response) {
  try {
    const item = await findMenuItem(req.params["id"]!);
    if (!item) { sendError(res, "Menu item not found", 404); return; }
    await item.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("deleteMenuItem error:", err);
    sendError(res, "Failed to delete menu item", 500);
  }
}

export async function toggleBestseller(req: Request, res: Response) {
  try {
    const item = await findMenuItem(req.params["id"]!);
    if (!item) { sendError(res, "Menu item not found", 404); return; }
    item.isBestseller = !item.isBestseller;
    await item.save();
    sendSuccess(res, item, `Bestseller ${item.isBestseller ? "enabled" : "disabled"}`);
  } catch (err) {
    console.error("toggleBestseller error:", err);
    sendError(res, "Failed to toggle bestseller", 500);
  }
}

export async function toggleAvailability(req: Request, res: Response) {
  try {
    const item = await findMenuItem(req.params["id"]!);
    if (!item) { sendError(res, "Menu item not found", 404); return; }
    item.isAvailable = !item.isAvailable;
    await item.save();
    sendSuccess(res, item, `Availability ${item.isAvailable ? "enabled" : "disabled"}`);
  } catch (err) {
    console.error("toggleAvailability error:", err);
    sendError(res, "Failed to toggle availability", 500);
  }
}
