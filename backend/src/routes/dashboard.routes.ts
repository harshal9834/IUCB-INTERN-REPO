import { Router } from "express";
import dashboardController from "../controllers/dashboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// Official API Contract
router.get("/metrics", protect, dashboardController.getMetrics);

// New Overview API for real-time dashboard data
router.get("/overview", protect, dashboardController.getOverview);

export default router;
