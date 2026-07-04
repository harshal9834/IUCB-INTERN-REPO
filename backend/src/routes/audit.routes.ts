// ============================================================
// Audit Routes – registered at /api/v1/audit-logs
// ============================================================

import { Router } from 'express';
import auditController from '../controllers/audit.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const auditRouter = Router();

// IMPORTANT: /statistics and /export must be defined BEFORE /:id
// so Express doesn't treat those literal strings as id params.

// GET /api/v1/audit-logs/statistics
auditRouter.get('/statistics', protect, auditController.getStatistics);

// GET /api/v1/audit-logs/export?format=csv|pdf
auditRouter.get('/export', protect, auditController.exportLogs);

// GET /api/v1/audit-logs
auditRouter.get('/', protect, auditController.getLogs);

// GET /api/v1/audit-logs/:id
auditRouter.get('/:id', protect, auditController.getLogById);

export default auditRouter;
