import { cloudinary } from "../config/cloudinary.js";
import fs from "fs";

export async function uploadToCloudinary(filePath: string, folder: string): Promise<string> {
  const result = await cloudinary.uploader.upload(filePath, { folder: `crc-restaurant/${folder}` });
  fs.unlink(filePath, () => {});
  return result.secure_url;
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
