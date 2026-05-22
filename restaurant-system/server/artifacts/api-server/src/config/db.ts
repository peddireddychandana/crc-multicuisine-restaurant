import mongoose from "mongoose";
import { logger } from "../lib/logger.js";

export async function connectDB() {
  const uri = process.env["MONGO_URI"];
  if (!uri) throw new Error("MONGO_URI environment variable is required");

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    logger.info("MongoDB connected");
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
    throw err;
  }
}
