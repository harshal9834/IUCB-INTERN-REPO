import { Router } from "express";
import credentialsController from "../controllers/credentials.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { setupAuditContext } from "../middlewares/audit.middleware.js";
import { auditCredentials, autoAudit } from "../middlewares/auto-audit.middleware.js";
import { AuditSeverity } from "@prisma/client";

const router = Router();

// Require auth for all credentials routes
router.use(protect);
router.use(setupAuditContext);

// Pending Queue (specific route)
router.get("/pending", credentialsController.getPendingCredentials);

// Issued Credentials (general list)
router.get("/", credentialsController.getIssuedCredentials);

// Generate Credential (specific action, must come before /:id POST)
router.post("/generate", 
  autoAudit({
    entityType: 'CREDENTIAL',
    module: 'Credentials',
    severity: AuditSeverity.MEDIUM,
    description: 'Generated new credential'
  }), 
  credentialsController.generateCredential
);

// Specific nested routes (must come before /:id to avoid shadowing)
router.get("/:id/email-logs", credentialsController.getEmailLogs);
router.get("/:id/audit-logs", credentialsController.getCredentialAuditLogs);

router.post("/:id/certificate", 
  autoAudit({
    entityType: 'CREDENTIAL',
    module: 'Credentials',
    severity: AuditSeverity.MEDIUM,
    description: 'Generated certificate'
  }), 
  credentialsController.generateCertificate
);

router.get("/:id/certificate/download", 
  autoAudit({
    entityType: 'CREDENTIAL',
    module: 'Credentials',
    severity: AuditSeverity.LOW,
    description: 'Downloaded certificate'
  }), 
  credentialsController.downloadCertificate
);

router.post("/:id/send-email", 
  autoAudit({
    entityType: 'CREDENTIAL',
    module: 'Credentials',
    severity: AuditSeverity.LOW,
    description: 'Sent certificate email'
  }), 
  credentialsController.sendCertificateEmail
);

router.patch("/:id/status", auditCredentials, credentialsController.updateStatus);

// Individual Credential (general :id route, must come last)
router.get("/:id", credentialsController.getCredentialById);

export default router;
