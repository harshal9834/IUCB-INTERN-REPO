import { Router } from 'express';
import SecurityMonitoringController from '../controllers/security-monitoring.controller.js';
import { protect as authenticateAdmin } from '../middlewares/auth.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

// Security dashboard
router.get(
  '/dashboard',
  auditMiddleware({
    entityType: 'SECURITY_DASHBOARD',
    module: 'SECURITY',
    getEntityId: () => 'security-dashboard',
    severity: 'LOW',
    description: 'Accessed security monitoring dashboard'
  }),
  SecurityMonitoringController.getSecurityDashboard
);

// Threat detection and management
router.post(
  '/threats/detect',
  auditMiddleware({
    entityType: 'SECURITY_THREAT',
    module: 'SECURITY',
    getEntityId: () => `threat-detection-${Date.now()}`,
    severity: 'HIGH',
    description: 'Executed security threat detection'
  }),
  SecurityMonitoringController.detectThreats
);

router.get(
  '/threats/:id',
  auditMiddleware({
    entityType: 'SECURITY_THREAT',
    module: 'SECURITY',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'MEDIUM',
    description: 'Accessed security threat details'
  }),
  SecurityMonitoringController.getThreatDetails
);

router.patch(
  '/threats/:id/status',
  auditMiddleware({
    entityType: 'SECURITY_THREAT',
    module: 'SECURITY',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'HIGH',
    description: 'Updated security threat status'
  }),
  SecurityMonitoringController.updateThreatStatus
);

// Security events
router.get(
  '/events',
  auditMiddleware({
    entityType: 'SECURITY_EVENT',
    module: 'SECURITY',
    getEntityId: () => 'security-events-list',
    severity: 'LOW',
    description: 'Retrieved security events timeline'
  }),
  SecurityMonitoringController.getSecurityEvents
);

// Security analytics
router.get(
  '/analytics',
  auditMiddleware({
    entityType: 'SECURITY_ANALYTICS',
    module: 'SECURITY',
    getEntityId: () => 'security-analytics',
    severity: 'LOW',
    description: 'Accessed security analytics and trends'
  }),
  SecurityMonitoringController.getSecurityAnalytics
);

// Security report export
router.post(
  '/export',
  auditMiddleware({
    entityType: 'SECURITY_EXPORT',
    module: 'SECURITY',
    getEntityId: () => `security-export-${Date.now()}`,
    severity: 'MEDIUM',
    description: 'Exported security report'
  }),
  SecurityMonitoringController.exportSecurityReport
);

// Security settings
router.get(
  '/settings',
  auditMiddleware({
    entityType: 'SECURITY_SETTINGS',
    module: 'SECURITY',
    getEntityId: () => 'security-settings',
    severity: 'LOW',
    description: 'Retrieved security monitoring settings'
  }),
  SecurityMonitoringController.getSecuritySettings
);

router.post(
  '/settings',
  auditMiddleware({
    entityType: 'SECURITY_SETTINGS',
    module: 'SECURITY',
    getEntityId: () => 'security-settings',
    severity: 'HIGH',
    description: 'Updated security monitoring settings'
  }),
  SecurityMonitoringController.updateSecuritySettings
);

// Manual security scan
router.post(
  '/scan',
  auditMiddleware({
    entityType: 'SECURITY_SCAN',
    module: 'SECURITY',
    getEntityId: () => `security-scan-${Date.now()}`,
    severity: 'HIGH',
    description: 'Triggered manual security scan'
  }),
  SecurityMonitoringController.triggerSecurityScan
);

export default router;