import { Router } from "express";
import { getCustomers, getTopCustomers } from "../controllers/customer.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/", authenticate, requireAdmin, getCustomers);
router.get("/top", authenticate, requireAdmin, getTopCustomers);
router.get("/:id", authenticate, requireAdmin, async (req, res) => {
  const { getCustomers } = await import("../controllers/customer.controller.js");
  req.query = { ...req.query, id: req.params.id };
  await getCustomers(req, res);
});

export default router;
