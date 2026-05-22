import { Router } from "express";
import { getReviews, createReview, updateReview, deleteReview } from "../controllers/review.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/", getReviews);
router.post("/", createReview);
router.patch("/:id", authenticate, requireAdmin, updateReview);
router.delete("/:id", authenticate, requireAdmin, deleteReview);

export default router;
