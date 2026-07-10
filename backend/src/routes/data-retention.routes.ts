import { Router } from 'express';
import DataRetentionController, { 
  createPolicyValidation,
  policyIdValidation,
  archiveIdValidation 
} from '../controllers/data-retention.controller.js';
import { protect as authenticateAdmin } from '../middlewares/auth.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

// Retention dashboard
router.get(
  '/dashboard',
  auditMiddleware({
    entityType: 'RETENTION_DASHBOARD',
    module: 'DATA_RETENTION',
    getEntityId: () => 'retention-dashboard',
    severity: 'LOW',
    description: 'Accessed data retention dashboard'
  }),
  DataRetentionController.getRetentionDashboard
);

// Execute retention policies
router.post(
  '/execute',
  auditMiddleware({
    entityType: 'RETENTION_EXECUTION',
    module: 'DATA_RETENTION',
    getEntityId: () => `retention-exec-${Date.now()}`,
    severity: 'CRITICAL',
    description: 'Executed data retention policies'
  }),
  DataRetentionController.executeRetentionPolicies
);

// Retention policy management
router.get(
  '/policies',
  auditMiddleware({
    entityType: 'RETENTION_POLICY',
    module: 'DATA_RETENTION',
    getEntityId: () => 'retention-policies-list',
    severity: 'LOW',
    description: 'Retrieved retention policies list'
  }),
  DataRetentionController.getRetentionPolicies
);

router.post(
  '/policies',
  createPolicyValidation,
  auditMiddleware({
    entityType: 'RETENTION_POLICY',
    module: 'DATA_RETENTION',
    getEntityId: (req, result) => result?.id || 'new-policy',
    severity: 'HIGH',
    description: 'Created new retention policy'
  }),
  DataRetentionController.createRetentionPolicy
);

router.patch(
  '/policies/:id',
  policyIdValidation,
  auditMiddleware({
    entityType: 'RETENTION_POLICY',
    module: 'DATA_RETENTION',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'HIGH',
    description: 'Updated retention policy'
  }),
  DataRetentionController.updateRetentionPolicy
);

router.delete(
  '/policies/:id',
  policyIdValidation,
  auditMiddleware({
    entityType: 'RETENTION_POLICY',
    module: 'DATA_RETENTION',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'HIGH',
    description: 'Deleted retention policy'
  }),
  DataRetentionController.deleteRetentionPolicy
);

// Test retention policy
router.post(
  '/policies/:id/test',
  policyIdValidation,
  auditMiddleware({
    entityType: 'RETENTION_POLICY',
    module: 'DATA_RETENTION',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'MEDIUM',
    description: 'Tested retention policy'
  }),
  DataRetentionController.testRetentionPolicy
);

// Archive management
router.get(
  '/archives',
  auditMiddleware({
    entityType: 'DATA_ARCHIVE',
    module: 'DATA_RETENTION',
    getEntityId: () => 'archives-list',
    severity: 'LOW',
    description: 'Retrieved archives list'
  }),
  DataRetentionController.getArchives
);

router.get(
  '/archives/:id',
  archiveIdValidation,
  auditMiddleware({
    entityType: 'DATA_ARCHIVE',
    module: 'DATA_RETENTION',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'LOW',
    description: 'Retrieved archive details'
  }),
  DataRetentionController.getArchiveDetails
);

router.post(
  '/archives/:id/restore',
  archiveIdValidation,
  auditMiddleware({
    entityType: 'DATA_ARCHIVE',
    module: 'DATA_RETENTION',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'CRITICAL',
    description: 'Restored data from archive'
  }),
  DataRetentionController.restoreFromArchive
);

router.get(
  '/archives/:id/download',
  archiveIdValidation,
  auditMiddleware({
    entityType: 'DATA_ARCHIVE',
    module: 'DATA_RETENTION',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'MEDIUM',
    description: 'Downloaded archive file'
  }),
  DataRetentionController.downloadArchive
);

// Retention analytics
router.get(
  '/analytics',
  auditMiddleware({
    entityType: 'RETENTION_ANALYTICS',
    module: 'DATA_RETENTION',
    getEntityId: () => 'retention-analytics',
    severity: 'LOW',
    description: 'Accessed retention analytics'
  }),
  DataRetentionController.getRetentionAnalytics
);

export default router;