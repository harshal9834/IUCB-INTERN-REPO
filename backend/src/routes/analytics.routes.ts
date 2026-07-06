import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const analyticsController = new AnalyticsController();
const router = Router();

// Apply authentication to all analytics routes
router.use(protect);
// Restrict to admin based on PRD security requirements
router.use(requireRole(["ADMIN", "SUPER_ADMIN"]));

router.get("/overview", analyticsController.getOverviewStats);
router.get("/charts", analyticsController.getChartsData);
router.get("/recent-activities", analyticsController.getRecentActivities);

// Export Routes
router.get("/export/excel", analyticsController.exportExcel);

export default router;
