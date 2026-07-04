// ============================================================
// Audit Controller – receive request → call service → respond.
// No business logic here.
// ============================================================

import type { Request, Response } from 'express';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/AsyncHandler.js';
import auditService from '../services/audit.service.js';
import { auditQuerySchema } from '../validators/audit.validator.js';
import { exportAuditCsv, exportAuditPdf } from '../utils/audit.export.js';

class AuditController {
  // ----------------------------------------------------------
  // GET /api/v1/audit-logs
  // ----------------------------------------------------------
  public getLogs = asyncHandler(async (req: Request, res: Response) => {
    const query = auditQuerySchema.parse(req.query);
    const data = await auditService.getLogs(query);
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Audit logs fetched successfully.'));
  });

  // ----------------------------------------------------------
  // GET /api/v1/audit-logs/statistics
  // ----------------------------------------------------------
  public getStatistics = asyncHandler(async (_req: Request, res: Response) => {
    const data = await auditService.getStatistics();
    return res
      .status(200)
      .json(new ApiResponse(200, data, 'Audit statistics fetched successfully.'));
  });

  // ----------------------------------------------------------
  // GET /api/v1/audit-logs/:id
  // ----------------------------------------------------------
  public getLogById = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) throw new ApiError(400, 'Log ID is required.');

    const log = await auditService.getLogById(id);
    if (!log) throw new ApiError(404, 'Audit log not found.');

    return res
      .status(200)
      .json(new ApiResponse(200, log, 'Audit log detail fetched successfully.'));
  });

  // ----------------------------------------------------------
  // GET /api/v1/audit-logs/export?format=csv|pdf
  // ----------------------------------------------------------
  public exportLogs = asyncHandler(async (req: Request, res: Response) => {
    const query = auditQuerySchema.parse(req.query);
    const format = query.format ?? 'csv';
    const logs = await auditService.getLogsForExport(query);

    if (format === 'pdf') {
      await exportAuditPdf(logs, res);
      return;
    }

    // Default: CSV
    exportAuditCsv(logs, res);
  });
}

export default new AuditController();
