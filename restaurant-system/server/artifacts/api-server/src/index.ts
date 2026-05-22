import "dotenv/config";
import http from "http";
import app from "./app.js";
import { logger } from "./lib/logger.js";
import { connectDB } from "./config/db.js";
import { configureCloudinary } from "./config/cloudinary.js";
import { initSocket } from "./config/socket.js";

const rawPort = process.env["PORT"];
if (!rawPort) throw new Error("PORT environment variable is required but was not provided.");
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT value: "${rawPort}"`);

async function bootstrap() {
  configureCloudinary();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(port, () => {
    logger.info({ port }, "CRC Restaurant API Server listening");
  });

  // Connect DB after server is up so startup doesn't block on network
  connectDB().catch((err) => {
    logger.error({ err }, "MongoDB connection failed — server running without DB");
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
