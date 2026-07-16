import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import organizationsRoutes from "./organizations.routes.js";
import auditorsRoutes from "./auditors.routes.js";
import advisorsRoutes from "./advisors.routes.js";
import credentialsRoutes from "./credentials.routes.js";
import advisoryRoutes from "./advisory.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import auditRoutes from "./audit.routes.js";
import bulkEmailRoutes from "./bulk-email.routes.js";
import directoryRoutes from "./directory.routes.js";
import verifyRoutes from "./verify.routes.js";
import resourcesRoutes from "./resources.routes.js";
import certificateTemplateRoutes from "./certificate-template.routes.js";
import { AdvisoryController } from "../controllers/advisory.controller.js";

const rootRouter = Router();
const advisoryCtrl = new AdvisoryController();

// API Health Check
rootRouter.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Auth & Admin (existing)
rootRouter.use("/v1/auth", authRoutes);
rootRouter.use("/admins", adminRoutes);

// Phase 4: Feature Module Routes (PRD-compliant)
rootRouter.use("/v1/dashboard", dashboardRoutes);
rootRouter.use("/v1/organizations", organizationsRoutes);
rootRouter.use("/v1/auditors", auditorsRoutes);
rootRouter.use("/v1/advisors", advisorsRoutes);
rootRouter.use("/v1/credentials", credentialsRoutes);
rootRouter.use("/v1/advisory", advisoryRoutes);
rootRouter.use("/v1/analytics", analyticsRoutes);
rootRouter.use("/v1/audit-logs", auditRoutes);

// Bulk Email & Certificate System
rootRouter.use("/v1/bulk-email", bulkEmailRoutes);

// Directory & Verification (completed-dash)
rootRouter.use("/v1/directory", directoryRoutes);
rootRouter.use("/v1/verify", verifyRoutes);

// Resources (completed-dash)
rootRouter.use("/v1/resources", resourcesRoutes);

// Certificate Templates (completed-dash)
rootRouter.use("/v1/certificate-templates", certificateTemplateRoutes);

// PRD: GET /api/v1/public/advisors
rootRouter.get("/v1/public/advisors", advisoryCtrl.getPublicAdvisors);

export default rootRouter;
