import { Request, Response } from "express";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import MenuItem from "../models/MenuItem.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { createNotification } from "../services/notification.service.js";
import { getIO } from "../config/socket.js";

async function resolveMenuItemId(id: string) {
  const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);
  if (isObjectId) return id;
  if (/^\d+$/.test(id)) {
    const targetId = parseInt(id, 10);
    const items = await MenuItem.find({}, "_id").limit(1000).lean();
    for (const item of items) {
      const vid = parseInt(item._id.toString().slice(-8), 16) || 0;
      if (vid === targetId) return item._id.toString();
    }
  }
  return id;
}

async function resolveReviewId(id: string) {
  const isObjectId = /^[a-fA-F0-9]{24}$/.test(id);
  if (isObjectId) return id;
  if (/^\d+$/.test(id)) {
    const targetId = parseInt(id, 10);
    const reviews = await Review.find({}, "_id").limit(1000).lean();
    for (const review of reviews) {
      const vid = parseInt(review._id.toString().slice(-8), 16) || 0;
      if (vid === targetId) return review._id.toString();
    }
    return null;
  }
  return id;
}

export async function getReviews(req: Request, res: Response) {
  try {
    let { menuItem } = req.query as Record<string, string | undefined>;
    const filter: Record<string, unknown> = { isApproved: true };
    if (menuItem) filter["menuItem"] = await resolveMenuItemId(String(menuItem));
    const reviews = await Review.find(filter).populate("menuItem", "name image").sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("getReviews error:", err);
    sendError(res, "Failed to fetch reviews", 500);
  }
}

export async function createReview(req: Request, res: Response) {
  try {
    let { customerName, menuItem, rating, reviewText, comment } = req.body as Record<string, unknown>;
    reviewText = reviewText || comment;
    menuItem = menuItem || req.body["menuItemId"];
    if (!customerName || !rating) {
      res.status(400).json({ success: false, message: "Validation error", errors: ["customerName and rating are required"] });
      return;
    }
    const reviewData: Record<string, unknown> = { customerName, rating };
    if (reviewText) reviewData["reviewText"] = reviewText;
    if (menuItem) {
      reviewData["menuItem"] = await resolveMenuItemId(String(menuItem));
    }

    const review = await Review.create(reviewData);

    if (reviewData["menuItem"]) {
      const allReviews = await Review.find({ menuItem: reviewData["menuItem"], isApproved: true });
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await MenuItem.findByIdAndUpdate(reviewData["menuItem"], {
        ratings: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
      });
    }

    const io = getIO();
    io.emit("new-review", review);

    await createNotification("New Review", `${customerName} left a ${rating}-star review`, "review", { reviewId: review.id });

    res.status(201).json(review);
  } catch (err) {
    console.error("createReview error:", err);
    sendError(res, "Failed to create review", 500);
  }
}

export async function updateReview(req: Request, res: Response) {
  const resolvedId = await resolveReviewId(req.params["id"]);
  if (!resolvedId) { sendError(res, "Review not found", 404); return; }
  const body = { ...req.body };
  if (body.isVisible !== undefined) {
    body.isApproved = body.isVisible;
    delete body.isVisible;
  }
  if (body.comment !== undefined) {
    body.reviewText = body.comment;
    delete body.comment;
  }
  const review = await Review.findByIdAndUpdate(resolvedId, body, { new: true, runValidators: true });
  if (!review) { sendError(res, "Review not found", 404); return; }
  res.json(review);
}

export async function deleteReview(req: Request, res: Response) {
  const resolvedId = await resolveReviewId(req.params["id"]);
  if (!resolvedId) { sendError(res, "Review not found", 404); return; }
  const review = await Review.findByIdAndDelete(resolvedId);
  if (!review) { sendError(res, "Review not found", 404); return; }
  const io = getIO();
  io.emit("review-deleted", { reviewId: req.params["id"] });
  res.json({ success: true });
}
