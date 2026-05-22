import { Request, Response } from "express";
import { uploadToCloudinary } from "../services/cloudinary.service.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

export async function uploadImage(req: Request, res: Response) {
  if (!req.file) { sendError(res, "No file uploaded", 400); return; }
  const folder = (req.query["folder"] as string) || "general";
  const url = await uploadToCloudinary(req.file.path, folder);
  sendSuccess(res, { url }, "Image uploaded");
}
