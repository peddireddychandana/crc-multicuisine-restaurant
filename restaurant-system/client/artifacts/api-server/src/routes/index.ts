import { Router, type IRouter } from "express";
import healthRouter from "./health";
import menuRouter from "./menu";
import offersRouter from "./offers";
import ordersRouter from "./orders";
import reviewsRouter from "./reviews";

const router: IRouter = Router();

router.use(healthRouter);
router.use(menuRouter);
router.use(offersRouter);
router.use(ordersRouter);
router.use(reviewsRouter);

export default router;
