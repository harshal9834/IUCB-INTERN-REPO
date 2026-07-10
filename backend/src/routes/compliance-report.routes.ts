import { Router } from 'express';
import ComplianceReportController, { 
  generateReportValidation,
  updateReportValidation,
  reportIdValidation
} from '../controllers/compliance-report.controller.js';
import { protect as authenticateAdmin } from '../middlewares/auth.middleware.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';
import { AdminRole } from '@prisma/client';

const router = Router();

// Apply authentication to all routes
router.use(authenticateAdmin);

// Generate compliance report
router.post(
  '/generate',
  generateReportValidation,
  auditMiddleware({
    entityType: 'COMPLIANCE_REPORT',
    module: 'COMPLIANCE',
    getEntityId: (req, result) => result?.id || `report-${Date.now()}`,
    severity: 'MEDIUM',
    description: 'Generated compliance report'
  }),
  ComplianceReportController.generateReport
);

// Get compliance reports list
router.get(
  '/',
  auditMiddleware({
    entityType: 'COMPLIANCE_REPORT',
    module: 'COMPLIANCE',
    getEntityId: () => 'reports-list',
    severity: 'LOW',
    description: 'Retrieved compliance reports list'
  }),
  ComplianceReportController.getReports
);

// Get compliance dashboard
router.get(
  '/dashboard',
  auditMiddleware({
    entityType: 'COMPLIANCE_DASHBOARD',
    module: 'COMPLIANCE',
    getEntityId: () => 'compliance-dashboard',
    severity: 'LOW',
    description: 'Accessed compliance dashboard'
  }),
  ComplianceReportController.getComplianceDashboard
);

// Get report templates
router.get('/templates', ComplianceReportController.getReportTemplates);

// Schedule automated report
router.post(
  '/schedule',
  generateReportValidation,
  auditMiddleware({
    entityType: 'SCHEDULED_REPORT',
    module: 'COMPLIANCE',
    getEntityId: (req, result) => result?.id || `scheduled-${Date.now()}`,
    severity: 'MEDIUM',
    description: 'Scheduled automated compliance report'
  }),
  ComplianceReportController.scheduleReport
);

// Get scheduled reports
router.get('/scheduled', ComplianceReportController.getScheduledReports);

// Cancel scheduled report
router.delete(
  '/scheduled/:id',
  reportIdValidation,
  auditMiddleware({
    entityType: 'SCHEDULED_REPORT',
    module: 'COMPLIANCE',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'MEDIUM',
    description: 'Cancelled scheduled compliance report'
  }),
  ComplianceReportController.cancelScheduledReport
);

// Get specific report by ID
router.get(
  '/:id',
  reportIdValidation,
  auditMiddleware({
    entityType: 'COMPLIANCE_REPORT',
    module: 'COMPLIANCE',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'LOW',
    description: 'Accessed compliance report details'
  }),
  ComplianceReportController.getReportById
);

// Download report file
router.get(
  '/:id/download',
  reportIdValidation,
  auditMiddleware({
    entityType: 'COMPLIANCE_REPORT',
    module: 'COMPLIANCE',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'MEDIUM',
    description: 'Downloaded compliance report file'
  }),
  ComplianceReportController.downloadReport
);

// Update report status/metadata
router.patch(
  '/:id',
  reportIdValidation,
  updateReportValidation,
  auditMiddleware({
    entityType: 'COMPLIANCE_REPORT',
    module: 'COMPLIANCE',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'MEDIUM',
    description: 'Updated compliance report'
  }),
  ComplianceReportController.updateReport
);

// Delete report (Super Admin only)
router.delete(
  '/:id',
  reportIdValidation,
  auditMiddleware({
    entityType: 'COMPLIANCE_REPORT',
    module: 'COMPLIANCE',
    getEntityId: (req) => Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    severity: 'HIGH',
    description: 'Deleted compliance report'
  }),
  ComplianceReportController.deleteReport
);

export default router;