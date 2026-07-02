import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();
const dashboardController = new DashboardController();

router.get("/metrics", protect, dashboardController.getMetrics);

export default router;
