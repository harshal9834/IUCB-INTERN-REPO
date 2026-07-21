import { Router } from "express";
import { AdvisorsController } from "../controllers/advisors.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { setupAuditContext } from "../middlewares/audit.middleware.js";
import { auditAdvisors, autoAudit } from "../middlewares/auto-audit.middleware.js";
import { AuditSeverity } from "../types/audit-enums.js";

const router = Router();
const ctrl = new AdvisorsController();

// All routes require authentication
router.use(protect);
router.use(setupAuditContext);

// GET /api/v1/advisors
router.get("/", ctrl.getAdvisors);

// GET /api/v1/advisors/:id
router.get("/:id", ctrl.getAdvisorById);

// GET /api/v1/advisors/:id/audit-logs
router.get("/:id/audit-logs", ctrl.getAdvisorAuditLogs);

// GET /api/v1/advisors/:id/email-logs
router.get("/:id/email-logs", ctrl.getAdvisorEmailLogs);

// PATCH /api/v1/advisors/:id - Update advisor with automatic audit logging
router.patch("/:id", auditAdvisors, ctrl.updateAdvisor);

// PATCH /api/v1/advisors/:id/status - Status change with automatic audit logging
router.patch("/:id/status", auditAdvisors, ctrl.updateAdvisorStatus);
router.put("/:id/status", auditAdvisors, ctrl.updateAdvisorStatus);

// POST /api/v1/advisors/:id/send-email - Email sending with audit logging
router.post("/:id/send-email", 
  autoAudit({
    entityType: 'ADVISOR',
    module: 'Advisory',
    severity: AuditSeverity.LOW,
    description: 'Sent email to advisor'
  }), 
  ctrl.sendEmail
);

// DELETE /api/v1/advisors/:id - Delete advisor with automatic audit logging
router.delete("/:id", auditAdvisors, ctrl.deleteAdvisor);

export default router;
