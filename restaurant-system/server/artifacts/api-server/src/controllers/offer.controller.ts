import { Request, Response } from "express";
import { Types } from "mongoose";
import Offer from "../models/Offer.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { getIO } from "../config/socket.js";

export async function getOffers(_req: Request, res: Response) {
  const now = new Date();
  const offers = await Offer.find({ isActive: true, endDate: { $gte: now } }).sort({ isFeatured: -1, createdAt: -1 });
  res.json(offers);
}

export async function createOffer(req: Request, res: Response) {
  const { discountPercent, originalPrice, discountedPrice, badge, category, bannerUrl, ...rest } = req.body as Record<string, unknown>;
  const data: Record<string, unknown> = {
    ...rest,
    originalPrice,
    discountedPrice,
    discountPercentage: discountPercent ?? (
      originalPrice && discountedPrice
        ? ((Number(originalPrice) - Number(discountedPrice)) / Number(originalPrice)) * 100
        : undefined
    ),
    bannerImage: bannerUrl || rest.bannerImage || "",
  };
  const offer = await Offer.create(data);
  const io = getIO();
  io.emit("new-offer", offer);
  res.status(201).json(offer);
}

async function resolveOfferObjectId(id: string): Promise<string | null> {
  if (Types.ObjectId.isValid(id) && id.length === 24) return id;
  const num = Number(id);
  if (!Number.isNaN(num)) {
    const hexSuffix = num.toString(16).padStart(8, "0");
    const offer = await Offer.findOne({
      $expr: { $eq: [{ $toLower: { $substrCP: [{ $toString: "$_id" }, 16, 8] } }, hexSuffix] },
    });
    return offer?._id?.toString() ?? null;
  }
  return null;
}

export async function updateOffer(req: Request, res: Response) {
  const { discountPercent, badge, category, bannerUrl, ...rest } = req.body as Record<string, unknown>;
  const data: Record<string, unknown> = {
    ...rest,
    discountPercentage: discountPercent ?? rest.discountPercentage,
    badge: badge ?? "",
    category: category ?? "",
    bannerImage: bannerUrl ?? rest.bannerImage ?? rest.bannerUrl ?? "",
  };
  const _id = await resolveOfferObjectId(req.params["id"]);
  if (!_id) { sendError(res, "Offer not found", 404); return; }
  const offer = await Offer.findByIdAndUpdate(_id, data, { new: true });
  if (!offer) { sendError(res, "Offer not found", 404); return; }
  res.json(offer);
}

export async function deleteOffer(req: Request, res: Response) {
  const _id = await resolveOfferObjectId(req.params["id"]);
  if (!_id) { sendError(res, "Offer not found", 404); return; }
  const offer = await Offer.findByIdAndDelete(_id);
  if (!offer) { sendError(res, "Offer not found", 404); return; }
  res.json({ success: true });
}
