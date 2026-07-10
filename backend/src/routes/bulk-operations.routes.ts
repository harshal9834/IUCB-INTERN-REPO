import { Router } from 'express';
import BulkOperationsController from '../controllers/bulk-operations.controller.js';
import { protect, requireRole } from '../middlewares/auth.middleware.js';
import { setupAuditContext } from '../middlewares/audit.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();

// Apply authentication and audit context to all routes
router.use(protect);
router.use(setupAuditContext);

// Bulk operations require admin role or higher
router.use(requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]));

// Organizations bulk operations
router.patch('/organizations/update', BulkOperationsController.bulkUpdateOrganizations);
router.patch('/organizations/status', BulkOperationsController.bulkUpdateOrganizationStatus);

// Applications bulk operations
router.patch('/applications/approve', BulkOperationsController.bulkApproveApplications);
router.patch('/applications/reject', BulkOperationsController.bulkRejectApplications);

// Credentials bulk operations
router.patch('/credentials/status', BulkOperationsController.bulkUpdateCredentialStatus);
router.delete('/credentials/delete', BulkOperationsController.bulkDeleteCredentials);
router.post('/credentials/send-emails', BulkOperationsController.bulkSendCredentialEmails);

// Advisors bulk operations
router.patch('/advisors/status', BulkOperationsController.bulkUpdateAdvisorStatus);

// Bulk operation history
router.get('/history', BulkOperationsController.getBulkOperationHistory);

export default router;