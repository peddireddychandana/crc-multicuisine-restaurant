import { Router } from "express";
import {
  getDashboard,
  getRevenue,
  getOrdersAnalytics,
  getTopDishes,
  getNotificationController,
  markNotificationRead,
  getAnalyticsOverview,
  getSalesByCategory,
  getTopSellingDishes,
} from "../controllers/analytics.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/dashboard", authenticate, requireAdmin, getDashboard);
router.get("/overview", authenticate, requireAdmin, getAnalyticsOverview);
router.get("/revenue", authenticate, requireAdmin, getRevenue);
router.get("/orders", authenticate, requireAdmin, getOrdersAnalytics);
router.get("/top-dishes", authenticate, requireAdmin, getTopDishes);
router.get("/top-selling", authenticate, requireAdmin, getTopSellingDishes);
router.get("/sales-by-category", authenticate, requireAdmin, getSalesByCategory);
router.get("/notifications", authenticate, requireAdmin, getNotificationController);
router.patch("/notifications/:id/read", authenticate, requireAdmin, markNotificationRead);

export default router;
