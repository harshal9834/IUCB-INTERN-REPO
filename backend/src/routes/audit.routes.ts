import { Router } from 'express';
import AuditController from '../controllers/audit.controller.js';
import { protect, requireRole } from '../middlewares/auth.middleware.js';
import { setupAuditContext, auditExport } from '../middlewares/audit.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();

// Apply authentication and audit context to all routes
router.use(protect);
router.use(setupAuditContext);

// Audit logs management - Admin and Super Admin access
router.get(
  '/logs',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  AuditController.getAuditLogs
);

router.get(
  '/logs/search',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  AuditController.searchAuditLogs
);

router.get(
  '/logs/:id',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  AuditController.getAuditLogById
);

// Entity history - Admin and Super Admin access
router.get(
  '/history/:entityType/:entityId',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  AuditController.getEntityHistory
);

// Dashboard and analytics - Admin and Super Admin access
router.get(
  '/dashboard',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  AuditController.getDashboardData
);

router.get(
  '/stats',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  AuditController.getAuditStats
);

router.get(
  '/analytics',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  AuditController.getAnalytics
);

router.get(
  '/timeline',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  AuditController.getActivityTimeline
);

router.get(
  '/active-admins',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  AuditController.getMostActiveAdmins
);

// Alerts management - Admin and Super Admin access
router.get(
  '/alerts',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  AuditController.getActiveAlerts
);

router.patch(
  '/alerts/:id/acknowledge',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  AuditController.acknowledgeAlert
);

router.patch(
  '/alerts/:id/resolve',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  AuditController.resolveAlert
);

// Integrity verification - Super Admin only
router.get(
  '/integrity/verify',
  requireRole([AdminRole.SUPER_ADMIN]),
  AuditController.verifyIntegrity
);

// Export functionality with audit logging - Admin and Super Admin access
router.get(
  '/export/logs',
  requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  auditExport('AuditLog', 'Audit'),
  // TODO: Add export controller method
  (req, res) => res.json({ message: 'Export functionality will be implemented in Phase 6' })
);

export default router;