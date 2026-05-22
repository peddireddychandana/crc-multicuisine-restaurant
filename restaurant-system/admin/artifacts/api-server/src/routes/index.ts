import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import ordersRouter from "./orders";
import menuRouter from "./menu";
import offersRouter from "./offers";
import analyticsRouter from "./analytics";
import reviewsRouter from "./reviews";
import customersRouter from "./customers";
import tablesRouter from "./tables";
import notificationsRouter from "./notifications";
import settingsRouter from "./settings";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(ordersRouter);
router.use(menuRouter);
router.use(offersRouter);
router.use(analyticsRouter);
router.use(reviewsRouter);
router.use(customersRouter);
router.use(tablesRouter);
router.use(notificationsRouter);
router.use(settingsRouter);
router.use(storageRouter);

export default router;
