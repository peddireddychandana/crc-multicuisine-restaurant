import { Router } from "express";
import { getOrders, getOrder, createOrder, updateOrder, updateOrderStatus, deleteOrder } from "../controllers/order.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/", authenticate, requireAdmin, getOrders);
router.get("/:id", getOrder);
router.post("/", createOrder);
router.put("/:id", authenticate, requireAdmin, updateOrder);
router.patch("/:id", authenticate, requireAdmin, updateOrder);
router.put("/:id/status", authenticate, requireAdmin, updateOrderStatus);
router.patch("/:id/status", authenticate, requireAdmin, updateOrderStatus);
router.delete("/:id", authenticate, requireAdmin, deleteOrder);

export default router;
