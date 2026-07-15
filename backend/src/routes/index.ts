import { Router } from "express";
import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import organizationsRoutes from "./organizations.routes.js";
import auditorsRoutes from "./auditors.routes.js";
import advisorsRoutes from "./advisors.routes.js";
import credentialsRoutes from "./credentials.routes.js";
import advisoryRoutes from "./advisory.routes.js";
import applicationsRoutes from "./applications.routes.js";
import accreditationRoutes from "./accreditation.routes.js";
import auditorApplyRoutes from "./auditor.routes.js";
import trainingInstituteApplyRoutes from "./training-institute.routes.js";
import trainingInstitutesRoutes from "./training-institutes.routes.js";
import historyRoutes from "./history.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import searchRoutes from "./search.routes.js";
import auditRoutes from "./audit.routes.js";
import bulkOperationsRoutes from "./bulk-operations.routes.js";
import bulkEmailRoutes from "./bulk-email.routes.js";
import directoryRoutes from "./directory.routes.js";
import verifyRoutes from "./verify.routes.js";
import resourcesRoutes from "./resources.routes.js";

// Phase 5-10 Routes
import advancedSearchRoutes from "./advanced-search.routes.js";
import complianceReportRoutes from "./compliance-report.routes.js";
import securityMonitoringRoutes from "./security-monitoring.routes.js";
import integrityVerificationRoutes from "./integrity-verification.routes.js";
import dataRetentionRoutes from "./data-retention.routes.js";

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

// Phase 3: Entity History (Audit Trail)
rootRouter.use("/v1/history", historyRoutes);

// Phase 4: Analytics Dashboard
rootRouter.use("/v1/analytics", analyticsRoutes);

// Phase 5: Advanced Search
rootRouter.use("/v1/search", searchRoutes);
rootRouter.use("/v1/search", advancedSearchRoutes);

// Phase 6: Compliance Reports
rootRouter.use("/v1/compliance/reports", complianceReportRoutes);

// Phase 7: Security Monitoring
rootRouter.use("/v1/security", securityMonitoringRoutes);

// Phase 8: Integrity Verification
rootRouter.use("/v1/integrity", integrityVerificationRoutes);

// Phase 9: Data Retention
rootRouter.use("/v1/retention", dataRetentionRoutes);

// Phase 5: Applications Module (PRD-compliant)
rootRouter.use("/v1/applications", applicationsRoutes);          // GET /api/v1/applications, GET /api/v1/applications/:id, PATCH approve/reject
rootRouter.use("/v1/accreditation", accreditationRoutes);        // POST /api/v1/accreditation/apply
rootRouter.use("/v1/auditor", auditorApplyRoutes);               // POST /api/v1/auditor/apply
rootRouter.use("/v1/training-institute", trainingInstituteApplyRoutes); // POST /api/v1/training-institute/apply
rootRouter.use("/v1/training-institutes", trainingInstitutesRoutes); // GET/PATCH /api/v1/training-institutes (admin)
rootRouter.use("/v1/advisory", advisoryRoutes);                  // POST /api/v1/advisory/apply, GET /api/v1/advisory/applications

// Audit & Analytics System
rootRouter.use("/v1/audit", auditRoutes);                        // Audit logs, analytics, alerts, integrity

// Bulk Operations System  
rootRouter.use("/v1/bulk", bulkOperationsRoutes);                // Bulk operations with automatic audit logging

// Bulk Email & Certificate System
rootRouter.use("/v1/bulk-email", bulkEmailRoutes);

// PRD: GET /api/v1/public/advisors
rootRouter.get("/v1/public/advisors", advisoryCtrl.getPublicAdvisors);

// Directory Verification
rootRouter.use("/v1/directory", directoryRoutes);

// Public Certificate Verification (via verificationUrl)
rootRouter.use("/v1/verify", verifyRoutes);

// Resources
rootRouter.use("/v1/resources", resourcesRoutes);

// Certificate Templates
import certificateTemplateRoutes from "./certificate-template.routes.js";
rootRouter.use("/v1/certificate-templates", certificateTemplateRoutes);


export default rootRouter;
