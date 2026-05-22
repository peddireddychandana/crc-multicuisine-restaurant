import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.routes.js";
import menuRouter from "./menu.routes.js";
import categoryRouter from "./category.routes.js";
import orderRouter from "./order.routes.js";
import reviewRouter from "./review.routes.js";
import offerRouter from "./offer.routes.js";
import tableRouter from "./table.routes.js";
import analyticsRouter from "./analytics.routes.js";
import uploadRouter from "./upload.routes.js";
import dashboardRouter from "./dashboard.routes.js";
import storageRouter from "./storage.routes.js";
import customerRouter from "./customer.routes.js";
import notificationRouter from "./notification.routes.js";
import settingsRouter from "./settings.routes.js";
import {
  getMenuCategories,
  getMenuItemsList,
  getMenuItemById,
  getFeaturedDishes,
  getPopularDishes,
  getReviewStats,
  getOrderStats,
  getDishOfDay,
  getTopDishes,
  getOrdersSummary,
} from "../controllers/extra.controller.js";
import { getReviews, createReview, deleteReview } from "../controllers/review.controller.js";
import { getOrders, createOrder, getOrder, updateOrderStatus } from "../controllers/order.controller.js";
import { getOffers, createOffer, updateOffer, deleteOffer } from "../controllers/offer.controller.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/analytics", analyticsRouter);
router.use("/upload", uploadRouter);
router.use("/dashboard", dashboardRouter);
router.use("/storage", storageRouter);
router.use("/customers", customerRouter);
router.use("/notifications", notificationRouter);
router.use("/settings", settingsRouter);

// Menu routes - aligned with OpenAPI spec for client
router.get("/menu/categories", getMenuCategories);
router.get("/menu/items", getMenuItemsList);
router.get("/menu/items/:id", getMenuItemById);
router.get("/menu/featured", getFeaturedDishes);
router.get("/menu/popular", getPopularDishes);
router.get("/menu/top-dishes", getTopDishes);
router.use("/menu", menuRouter); // Original menu routes

// Category routes
router.use("/categories", categoryRouter);

// Order routes - aligned with OpenAPI spec
router.get("/orders/stats", getOrderStats);
router.get("/orders/summary", getOrdersSummary);
router.use("/orders", orderRouter);

// Offer routes - aligned with OpenAPI spec
router.get("/offers/dish-of-day", getDishOfDay);
router.use("/offers", offerRouter);

// Review routes - aligned with OpenAPI spec
router.get("/reviews/stats", getReviewStats);
router.use("/reviews", reviewRouter);

// Table routes
router.use("/tables", tableRouter);

export default router;
