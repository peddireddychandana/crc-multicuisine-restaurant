import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import { upload } from "../middleware/upload.middleware.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

const router = Router();

const OBJECT_DIR = path.resolve(process.env["PRIVATE_OBJECT_DIR"] || "./uploads");

/* Ensure upload directory exists */
if (!fs.existsSync(OBJECT_DIR)) {
  fs.mkdirSync(OBJECT_DIR, { recursive: true });
}

/**
 * Single-step file upload.
 * POST /api/storage/upload
 * Body: multipart form-data with field "file"
 * Returns: { objectPath }
 */
router.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      sendError(res, "No file uploaded", 400);
      return;
    }
    const objectPath = `/uploads/${req.file.filename}`;
    res.json({ objectPath });
  } catch {
    sendError(res, "Upload failed", 500);
  }
});

/**
 * Serve uploaded files by their filename.
 * GET /api/storage/uploads/:filename
 */
router.get("/uploads/:filename", async (req: Request, res: Response) => {
  try {
    const safePath = path.basename(req.params["filename"]!);
    const filePath = path.resolve(OBJECT_DIR, safePath);

    if (!filePath.startsWith(OBJECT_DIR)) {
      sendError(res, "Invalid path", 403);
      return;
    }

    if (!fs.existsSync(filePath)) {
      sendError(res, "File not found", 404);
      return;
    }

    res.sendFile(filePath);
  } catch {
    sendError(res, "Failed to serve file", 500);
  }
});

/**
 * Keep presigned URL endpoints for compatibility with useUpload hook.
 */
router.post("/uploads/request-url", async (_req: Request, res: Response) => {
  sendError(res, "Use POST /api/storage/upload instead", 400);
});

router.put("/upload-buffer/:filename", async (_req: Request, res: Response) => {
  sendError(res, "Use POST /api/storage/upload instead", 400);
});

export default router;
