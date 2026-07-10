import { Router } from 'express';
import IntegrityVerificationController from '../controllers/integrity-verification.controller.js';
import { protect as authenticateAdmin } from '../middlewares/auth.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';

const router = Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

// Integrity verification operations
router.post(
  '/verify-full',
  auditMiddleware({
    entityType: 'INTEGRITY_VERIFICATION',
    module: 'INTEGRITY',
    getEntityId: () => `full-verification-${Date.now()}`,
    severity: 'HIGH',
    description: 'Executed full audit trail integrity verification'
  }),
  IntegrityVerificationController.verifyFullIntegrity
);

router.post(
  '/verify-recent',
  auditMiddleware({
    entityType: 'INTEGRITY_VERIFICATION',
    module: 'INTEGRITY',
    getEntityId: () => `recent-verification-${Date.now()}`,
    severity: 'MEDIUM',
    description: 'Executed recent records integrity verification'
  }),
  IntegrityVerificationController.verifyRecentIntegrity
);

router.post(
  '/verify-record/:id',
  auditMiddleware({
    entityType: 'INTEGRITY_VERIFICATION',
    module: 'INTEGRITY',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'MEDIUM',
    description: 'Executed single record integrity verification'
  }),
  IntegrityVerificationController.verifyRecordIntegrity
);

// Integrity dashboard and statistics
router.get(
  '/dashboard',
  auditMiddleware({
    entityType: 'INTEGRITY_DASHBOARD',
    module: 'INTEGRITY',
    getEntityId: () => 'integrity-dashboard',
    severity: 'LOW',
    description: 'Accessed integrity verification dashboard'
  }),
  IntegrityVerificationController.getIntegrityDashboard
);

// Hash chain repair
router.post(
  '/repair-chain',
  auditMiddleware({
    entityType: 'HASH_CHAIN_REPAIR',
    module: 'INTEGRITY',
    getEntityId: () => `chain-repair-${Date.now()}`,
    severity: 'CRITICAL',
    description: 'Executed hash chain repair operation'
  }),
  IntegrityVerificationController.repairHashChain
);

// Hash calculation utility
router.post(
  '/calculate-hash',
  auditMiddleware({
    entityType: 'HASH_CALCULATION',
    module: 'INTEGRITY',
    getEntityId: () => `hash-calc-${Date.now()}`,
    severity: 'LOW',
    description: 'Calculated record hash for verification'
  }),
  IntegrityVerificationController.calculateRecordHash
);

// Verification history
router.get(
  '/verification-history',
  auditMiddleware({
    entityType: 'VERIFICATION_HISTORY',
    module: 'INTEGRITY',
    getEntityId: () => 'verification-history',
    severity: 'LOW',
    description: 'Retrieved integrity verification history'
  }),
  IntegrityVerificationController.getVerificationHistory
);

// Export integrity report
router.post(
  '/export',
  auditMiddleware({
    entityType: 'INTEGRITY_EXPORT',
    module: 'INTEGRITY',
    getEntityId: () => `integrity-export-${Date.now()}`,
    severity: 'MEDIUM',
    description: 'Exported integrity verification report'
  }),
  IntegrityVerificationController.exportIntegrityReport
);

// Scheduled verification management
router.post(
  '/schedule',
  auditMiddleware({
    entityType: 'VERIFICATION_SCHEDULE',
    module: 'INTEGRITY',
    getEntityId: () => `schedule-${Date.now()}`,
    severity: 'HIGH',
    description: 'Created integrity verification schedule'
  }),
  IntegrityVerificationController.scheduleVerification
);

router.get(
  '/schedules',
  auditMiddleware({
    entityType: 'VERIFICATION_SCHEDULE',
    module: 'INTEGRITY',
    getEntityId: () => 'verification-schedules',
    severity: 'LOW',
    description: 'Retrieved integrity verification schedules'
  }),
  IntegrityVerificationController.getScheduledVerifications
);

router.patch(
  '/schedules/:id',
  auditMiddleware({
    entityType: 'VERIFICATION_SCHEDULE',
    module: 'INTEGRITY',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'HIGH',
    description: 'Updated integrity verification schedule'
  }),
  IntegrityVerificationController.updateVerificationSchedule
);

export default router;