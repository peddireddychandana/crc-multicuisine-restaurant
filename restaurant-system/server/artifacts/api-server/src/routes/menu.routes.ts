import { Router } from "express";
import {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleBestseller,
  toggleAvailability,
} from "../controllers/menu.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/", getMenuItems);
router.get("/:id", getMenuItem);
router.post("/", authenticate, requireAdmin, createMenuItem);
router.put("/:id", authenticate, requireAdmin, updateMenuItem);
router.patch("/:id", authenticate, requireAdmin, updateMenuItem);
router.delete("/:id", authenticate, requireAdmin, deleteMenuItem);
router.patch("/:id/bestseller", authenticate, requireAdmin, toggleBestseller);
router.patch("/:id/availability", authenticate, requireAdmin, toggleAvailability);

export default router;
