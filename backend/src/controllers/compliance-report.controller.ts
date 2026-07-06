import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/audit.middleware.js';
import ComplianceReportService, { ComplianceReportConfig } from '../services/compliance-report.service.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { AdminRole } from '@prisma/client';
import { body, param, query, validationResult } from 'express-validator';
import db from '../config/db.js';

export class ComplianceReportController {

  /**
   * Generate a new compliance report
   * POST /api/v1/compliance/reports/generate
   */
  generateReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    const config: ComplianceReportConfig = {
      reportType: req.body.reportType,
      title: req.body.title,
      description: req.body.description,
      dateFrom: new Date(req.body.dateFrom),
      dateTo: new Date(req.body.dateTo),
      includeEntities: req.body.includeEntities,
      includeSeverities: req.body.includeSeverities,
      includeActions: req.body.includeActions,
      includeModules: req.body.includeModules,
      filterCriteria: req.body.filterCriteria,
      format: req.body.format || 'JSON',
      includeSummary: req.body.includeSummary ?? true,
      includeCharts: req.body.includeCharts ?? true,
      includeRecommendations: req.body.includeRecommendations ?? true,
      complianceStandard: req.body.complianceStandard,
      auditScope: req.body.auditScope,
      riskAssessment: req.body.riskAssessment ?? true,
      isScheduled: req.body.isScheduled ?? false,
      scheduleFrequency: req.body.scheduleFrequency,
      scheduleDay: req.body.scheduleDay,
      notifyEmails: req.body.notifyEmails
    };

    const generatedBy = req.admin!.id;
    const reportData = await ComplianceReportService.generateComplianceReport(config, generatedBy);

    res.status(201).json(new ApiResponse(201, reportData, 'Compliance report generated successfully'));
  });

  /**
   * Get list of compliance reports with filtering
   * GET /api/v1/compliance/reports
   */
  getReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      page = 1,
      limit = 20,
      reportType,
      dateFrom,
      dateTo,
      generatedBy,
      sortBy = 'generatedAt',
      sortOrder = 'desc'
    } = req.query;

    const where: any = {};

    if (reportType) where.reportType = reportType;
    if (generatedBy) where.generatedBy = generatedBy;
    if (dateFrom || dateTo) {
      where.generatedAt = {};
      if (dateFrom) where.generatedAt.gte = new Date(dateFrom as string);
      if (dateTo) where.generatedAt.lte = new Date(dateTo as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [reports, totalCount] = await Promise.all([
      db.complianceReport.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          generator: {
            select: { id: true, fullName: true, email: true }
          }
        }
      }),
      db.complianceReport.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json(new ApiResponse(200, {
      reports,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    }, 'Compliance reports retrieved successfully'));
  });

  /**
   * Get a specific compliance report by ID
   * GET /api/v1/compliance/reports/:id
   */
  getReportById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const report = await db.complianceReport.findUnique({
      where: { id },
      include: {
        generator: {
          select: { id: true, fullName: true, email: true }
        }
      }
    });

    if (!report) {
      throw new ApiError(404, 'Compliance report not found');
    }

    res.json(new ApiResponse(200, report, 'Compliance report retrieved successfully'));
  });

  /**
   * Download compliance report file
   * GET /api/v1/compliance/reports/:id/download
   */
  downloadReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { format } = req.query;

    const report = await db.complianceReport.findUnique({
      where: { id }
    });

    if (!report) {
      throw new ApiError(404, 'Compliance report not found');
    }

    const reportFormat = (format as string) || 'JSON';
    
    // Set appropriate headers
    const filename = `compliance-report-${id}.${reportFormat.toLowerCase()}`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', this.getContentType(reportFormat));

    if (reportFormat === 'JSON') {
      res.json(report.parameters);
    } else {
      // For other formats, we'd implement conversion logic here
      // For now, return JSON
      res.json(report.parameters);
    }
  });

  /**
   * Update compliance report status or metadata
   * PATCH /api/v1/compliance/reports/:id
   */
  updateReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, description, parameters } = req.body;

    const report = await db.complianceReport.findUnique({
      where: { id }
    });

    if (!report) {
      throw new ApiError(404, 'Compliance report not found');
    }

    // Only allow updating certain fields
    const updateData: any = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (parameters) updateData.parameters = parameters;

    const updatedReport = await db.complianceReport.update({
      where: { id },
      data: updateData
    });

    res.json(new ApiResponse(200, updatedReport, 'Compliance report updated successfully'));
  });

  /**
   * Delete a compliance report
   * DELETE /api/v1/compliance/reports/:id
   */
  deleteReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Check if user has permission to delete
    if (req.admin!.role !== AdminRole.SUPER_ADMIN) {
      const report = await db.complianceReport.findUnique({
        where: { id },
        select: { generatedBy: true }
      });

      if (!report) {
        throw new ApiError(404, 'Compliance report not found');
      }

      if (report.generatedBy !== req.admin!.id) {
        throw new ApiError(403, 'Access denied. You can only delete your own reports.');
      }
    }

    await db.complianceReport.delete({
      where: { id }
    });

    res.json(new ApiResponse(200, null, 'Compliance report deleted successfully'));
  });

  /**
   * Get compliance dashboard statistics
   * GET /api/v1/compliance/dashboard
   */
  getComplianceDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalReports,
      recentReports,
      reportsByType
    ] = await Promise.all([
      // Total reports count
      db.complianceReport.count(),

      // Recent reports (last 30 days)
      db.complianceReport.count({
        where: {
          generatedAt: { gte: thirtyDaysAgo }
        }
      }),

      // Reports by type
      db.complianceReport.groupBy({
        by: ['reportType'],
        _count: true,
        orderBy: {
          _count: {
            reportType: 'desc'
          }
        }
      })
    ]);

    const dashboard = {
      overview: {
        totalReports,
        recentReports,
        averageReportSize: 0
      },
      reportsByType: reportsByType.map((item: any) => ({
        type: item.reportType,
        count: item._count
      }))
    };

    res.json(new ApiResponse(200, dashboard, 'Compliance dashboard retrieved successfully'));
  });

  /**
   * Get compliance report templates
   * GET /api/v1/compliance/templates
   */
  getReportTemplates = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const templates = [
      {
        id: 'sox-quarterly',
        name: 'SOX Quarterly Report',
        reportType: 'SOX',
        description: 'Quarterly Sarbanes-Oxley compliance report',
        defaultConfig: {
          reportType: 'SOX',
          format: 'PDF',
          includeSummary: true,
          includeCharts: true,
          includeRecommendations: true,
          complianceStandard: 'SOX',
          riskAssessment: true
        }
      },
      {
        id: 'gdpr-annual',
        name: 'GDPR Annual Assessment',
        reportType: 'GDPR',
        description: 'Annual GDPR compliance assessment report',
        defaultConfig: {
          reportType: 'GDPR',
          format: 'PDF',
          includeSummary: true,
          includeCharts: true,
          includeRecommendations: true,
          complianceStandard: 'GDPR',
          riskAssessment: true
        }
      },
      {
        id: 'iso27001-audit',
        name: 'ISO 27001 Audit Report',
        reportType: 'ISO_27001',
        description: 'ISO 27001 information security management audit',
        defaultConfig: {
          reportType: 'ISO_27001',
          format: 'PDF',
          includeSummary: true,
          includeCharts: true,
          includeRecommendations: true,
          complianceStandard: 'ISO 27001:2013',
          riskAssessment: true
        }
      }
    ];

    res.json(new ApiResponse(200, templates, 'Compliance report templates retrieved successfully'));
  });

  /**
   * Schedule automated compliance report
   * POST /api/v1/compliance/reports/schedule
   */
  scheduleReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    // Save scheduled report configuration
    const scheduledReport = await db.complianceReport.create({
      data: {
        reportType: req.body.reportType,
        title: req.body.title,
        description: req.body.description,
        parameters: req.body as any,
        generatedBy: req.admin!.id,
        dateFrom: new Date(req.body.dateFrom),
        dateTo: new Date(req.body.dateTo),
        fileFormat: req.body.format || 'JSON'
      }
    });

    res.status(201).json(new ApiResponse(201, scheduledReport, 'Compliance report scheduled successfully'));
  });

  /**
   * Get scheduled reports
   * GET /api/v1/compliance/reports/scheduled
   */
  getScheduledReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const scheduledReports = await db.complianceReport.findMany({
      include: {
        generator: {
          select: { id: true, fullName: true, email: true }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });

    res.json(new ApiResponse(200, scheduledReports, 'Scheduled reports retrieved successfully'));
  });

  /**
   * Cancel scheduled report
   * DELETE /api/v1/compliance/reports/scheduled/:id
   */
  cancelScheduledReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const report = await db.complianceReport.findUnique({
      where: { id }
    });

    if (!report) {
      throw new ApiError(404, 'Scheduled report not found');
    }

    // Check permissions
    if (req.admin!.role !== AdminRole.SUPER_ADMIN && report.generatedBy !== req.admin!.id) {
      throw new ApiError(403, 'Access denied');
    }

    await db.complianceReport.delete({
      where: { id }
    });

    res.json(new ApiResponse(200, null, 'Scheduled report cancelled successfully'));
  });

  /**
   * Helper method to get content type for file downloads
   */
  private getContentType(format: string): string {
    switch (format.toUpperCase()) {
      case 'PDF':
        return 'application/pdf';
      case 'CSV':
        return 'text/csv';
      case 'XLSX':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'JSON':
      default:
        return 'application/json';
    }
  }
}

// Validation schemas
export const generateReportValidation = [
  body('reportType').isIn(['SOX', 'GDPR', 'HIPAA', 'PCI_DSS', 'ISO_27001', 'CUSTOM']),
  body('title').notEmpty().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('dateFrom').isISO8601().toDate(),
  body('dateTo').isISO8601().toDate(),
  body('format').optional().isIn(['JSON', 'PDF', 'CSV', 'XLSX']),
  body('includeSummary').optional().isBoolean(),
  body('includeCharts').optional().isBoolean(),
  body('includeRecommendations').optional().isBoolean(),
  body('riskAssessment').optional().isBoolean(),
  body('isScheduled').optional().isBoolean(),
  body('scheduleFrequency').optional().isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']),
  body('notifyEmails').optional().isArray()
];

export const updateReportValidation = [
  body('status').optional().isIn(['DRAFT', 'COMPLETED', 'REVIEWED', 'APPROVED', 'REJECTED', 'CANCELLED']),
  body('notes').optional().trim().isLength({ max: 1000 }),
  body('reviewedBy').optional().isUUID()
];

export const reportIdValidation = [
  param('id').notEmpty().isString()
];

export default new ComplianceReportController();