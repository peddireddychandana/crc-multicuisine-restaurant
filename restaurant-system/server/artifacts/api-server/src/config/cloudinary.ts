import { v2 as cloudinary } from "cloudinary";
import { logger } from "../lib/logger.js";

export function configureCloudinary() {
  const cloudName = process.env["CLOUDINARY_CLOUD_NAME"];
  const apiKey = process.env["CLOUDINARY_API_KEY"];
  const apiSecret = process.env["CLOUDINARY_API_SECRET"];

  if (!cloudName || !apiKey || !apiSecret) {
    logger.warn("Cloudinary credentials not fully configured");
    return;
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  logger.info("Cloudinary configured");
}

export { cloudinary };
