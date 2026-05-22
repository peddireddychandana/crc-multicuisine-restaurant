import { Router } from "express";
import { getTables, createTable, updateTable, getTableOccupancy } from "../controllers/table.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/", getTables);
router.get("/occupancy", authenticate, requireAdmin, getTableOccupancy);
router.post("/", authenticate, requireAdmin, createTable);
router.put("/:id", authenticate, requireAdmin, updateTable);
router.patch("/:id", authenticate, requireAdmin, updateTable);

export default router;
