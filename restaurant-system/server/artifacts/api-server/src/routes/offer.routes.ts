import { Router } from "express";
import { getOffers, createOffer, updateOffer, deleteOffer } from "../controllers/offer.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/", getOffers);
router.post("/", authenticate, requireAdmin, createOffer);
router.put("/:id", authenticate, requireAdmin, updateOffer);
router.patch("/:id", authenticate, requireAdmin, updateOffer);
router.delete("/:id", authenticate, requireAdmin, deleteOffer);

export default router;
