import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { logger } from "../lib/logger.js";

let io: SocketIOServer;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  const allowedOrigins = [
    process.env["CLIENT_URL"] || "http://localhost:3000",
    process.env["ADMIN_URL"] || "http://localhost:3001",
  ];
  io = new SocketIOServer(httpServer, {
    cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Client connected");
    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Client disconnected");
    });
    socket.on("join-room", (room: string) => {
      socket.join(room);
      logger.info({ socketId: socket.id, room }, "Client joined room");
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
