import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/", authenticate, requireAdmin, getSettings);
router.put("/", authenticate, requireAdmin, updateSettings);
router.patch("/", authenticate, requireAdmin, updateSettings);

export default router;
