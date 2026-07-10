import { Router } from "express";
import { AdminApplicationsController } from "../controllers/applications.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { setupAuditContext } from "../middlewares/audit.middleware.js";
import { auditApplications, autoAudit } from "../middlewares/auto-audit.middleware.js";
import { AuditSeverity } from "@prisma/client";

const router = Router();
const ctrl = new AdminApplicationsController();

// All routes require authentication
router.use(protect);
router.use(setupAuditContext);

// GET /api/v1/applications
router.get("/", ctrl.getApplications);

// GET /api/v1/applications/:id
router.get("/:id", ctrl.getApplicationById);

// PATCH /api/v1/applications/:id/approve - High severity for approval decisions
router.patch("/:id/approve", 
  autoAudit({
    entityType: 'APPLICATION',
    module: 'Applications',
    severity: AuditSeverity.MEDIUM,
    description: 'Approved application'
  }), 
  ctrl.approveApplication
);

// PATCH /api/v1/applications/:id/reject - High severity for rejection decisions
router.patch("/:id/reject", 
  autoAudit({
    entityType: 'APPLICATION',
    module: 'Applications',
    severity: AuditSeverity.MEDIUM,
    description: 'Rejected application'
  }), 
  ctrl.rejectApplication
);

export default router;
