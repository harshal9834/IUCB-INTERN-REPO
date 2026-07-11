import { Router } from "express";
import analyticsController from "../controllers/analytics.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// ─── Existing routes ──────────────────────────────────────────────────
router.get("/dashboard", protect, analyticsController.getDashboard);
router.get("/filters", protect, analyticsController.getFilters);
router.get("/reports", protect, analyticsController.getReports);
router.get("/export", protect, analyticsController.exportReport);
router.get("/report-metadata", protect, analyticsController.getReportMetadata);
router.get("/audit-logs", protect, analyticsController.getAuditLogs);
router.get("/resources", protect, analyticsController.getResourceSummary);
router.get("/organizations", protect, analyticsController.getOrganizationSummary);
router.get("/auditors", protect, analyticsController.getAuditorSummary);
router.get("/credentials", protect, analyticsController.getCredentialSummary);
router.get("/applications", protect, analyticsController.getApplicationSummary);
router.get("/advisors", protect, analyticsController.getAdvisorSummary);

// ─── New routes required by frontend ─────────────────────────────────
router.get("/overview", protect, analyticsController.getOverview);
router.get("/charts", protect, analyticsController.getCharts);
router.get("/recent-activities", protect, analyticsController.getRecentActivities);
router.get("/export/excel", protect, analyticsController.exportExcel);
router.get("/training-institutes", protect, analyticsController.getTrainingInstituteSummary);

export default router;
