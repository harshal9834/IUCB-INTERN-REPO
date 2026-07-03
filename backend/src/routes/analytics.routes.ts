import { Router } from "express";
import analyticsController from "../controllers/analytics.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

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

export default router;
