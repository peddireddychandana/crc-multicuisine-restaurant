import { Router } from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.post("/image", authenticate, requireAdmin, upload.single("image"), uploadImage);

export default router;
