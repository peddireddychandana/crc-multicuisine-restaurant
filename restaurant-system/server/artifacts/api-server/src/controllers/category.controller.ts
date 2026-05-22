import { Request, Response } from "express";
import Category from "../models/Category.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export async function getCategories(_req: Request, res: Response) {
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  sendSuccess(res, categories);
}

export async function createCategory(req: Request, res: Response) {
  const data = req.body as Record<string, unknown>;
  data["slug"] = slugify(data["name"] as string);
  const category = await Category.create(data);
  sendSuccess(res, category, "Category created", 201);
}

export async function updateCategory(req: Request, res: Response) {
  const category = await Category.findByIdAndUpdate(req.params["id"], req.body, { new: true });
  if (!category) { sendError(res, "Category not found", 404); return; }
  sendSuccess(res, category, "Category updated");
}

export async function deleteCategory(req: Request, res: Response) {
  const category = await Category.findByIdAndDelete(req.params["id"]);
  if (!category) { sendError(res, "Category not found", 404); return; }
  sendSuccess(res, null, "Category deleted");
}
