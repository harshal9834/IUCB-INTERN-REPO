import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/audit.middleware.js';
import IntegrityVerificationService from '../services/integrity-verification.service.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { AdminRole } from '@prisma/client';
import db from '../config/db.js';

export class IntegrityVerificationController {

  /**
   * Verify complete audit trail integrity
   * POST /api/v1/integrity/verify-full
   */
  verifyFullIntegrity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.admin!.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Access denied. Super Admin role required for full integrity verification.');
    }

    const report = await IntegrityVerificationService.verifyAuditTrailIntegrity();

    res.json(new ApiResponse(200, report, 'Full audit trail integrity verification completed'));
  });

  /**
   * Verify recent records integrity
   * POST /api/v1/integrity/verify-recent
   */
  verifyRecentIntegrity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { limit = 1000 } = req.body;

    if (limit > 10000) {
      throw new ApiError(400, 'Limit cannot exceed 10,000 records');
    }

    const report = await IntegrityVerificationService.verifyRecentRecords(Number(limit));

    res.json(new ApiResponse(200, report, `Recent ${limit} records integrity verification completed`));
  });

  /**
   * Verify specific audit record
   * POST /api/v1/integrity/verify-record/:id
   */
  verifyRecordIntegrity = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Get the record from database
    const record = await db.auditLog.findUnique({
      where: { id },
      select: {
        id: true,
        hash: true,
        previousHash: true,
        createdAt: true,
        entityType: true,
        entityId: true,
        action: true,
        actorId: true,
        description: true,
        oldValues: true,
        newValues: true,
        metadata: true
      }
    });

    if (!record) {
      throw new ApiError(404, 'Audit record not found');
    }

    const result = await IntegrityVerificationService.verifyAuditLogRecord(record);

    res.json(new ApiResponse(200, result, 'Record integrity verification completed'));
  });

  /**
   * Get integrity statistics and dashboard
   * GET /api/v1/integrity/dashboard
   */
  getIntegrityDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const statistics = await IntegrityVerificationService.getIntegrityStatistics();

    const dashboard = {
      ...statistics,
      overallHealth: this.calculateOverallHealth(statistics),
      recommendations: this.generateRecommendations(statistics)
    };

    res.json(new ApiResponse(200, dashboard, 'Integrity dashboard retrieved successfully'));
  });

  /**
   * Repair broken hash chain
   * POST /api/v1/integrity/repair-chain
   */
  repairHashChain = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.admin!.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Access denied. Super Admin role required for hash chain repair.');
    }

    const { startingLogId } = req.body;

    if (!startingLogId) {
      throw new ApiError(400, 'Starting log ID is required for chain repair');
    }

    const result = await IntegrityVerificationService.repairHashChain(startingLogId);

    res.json(new ApiResponse(200, result, 'Hash chain repair completed'));
  });

  /**
   * Calculate hash for verification
   * POST /api/v1/integrity/calculate-hash
   */
  calculateRecordHash = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { recordData } = req.body;

    if (!recordData) {
      throw new ApiError(400, 'Record data is required for hash calculation');
    }

    const hash = IntegrityVerificationService.calculateRecordHash(recordData);

    res.json(new ApiResponse(200, { hash, algorithm: 'SHA-256' }, 'Hash calculated successfully'));
  });

  /**
   * Get integrity verification history
   * GET /api/v1/integrity/verification-history
   */
  getVerificationHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      page = 1,
      limit = 20,
      status,
      dateFrom,
      dateTo
    } = req.query;

    const where: any = {};
    if (status) where.verificationStatus = status;
    if (dateFrom || dateTo) {
      where.verifiedAt = {};
      if (dateFrom) where.verifiedAt.gte = new Date(dateFrom as string);
      if (dateTo) where.verifiedAt.lte = new Date(dateTo as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [verifications, totalCount] = await Promise.all([
      db.auditIntegrity.findMany({
        where,
        skip,
        take,
        orderBy: { lastVerified: 'desc' }
      }),
      db.auditIntegrity.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json(new ApiResponse(200, {
      verifications,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    }, 'Verification history retrieved successfully'));
  });

  /**
   * Export integrity report
   * POST /api/v1/integrity/export
   */
  exportIntegrityReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { format = 'json', includeDetails = false } = req.body;

    if (!['json', 'csv', 'pdf'].includes(format)) {
      throw new ApiError(400, 'Invalid export format. Supported formats: json, csv, pdf');
    }

    const statistics = await IntegrityVerificationService.getIntegrityStatistics();
    const report = await IntegrityVerificationService.verifyRecentRecords(1000);

    const exportData = {
      generatedAt: new Date(),
      generatedBy: req.admin!.id,
      reportType: 'INTEGRITY_VERIFICATION',
      statistics,
      integrityReport: includeDetails ? report : {
        totalRecords: report.totalRecords,
        verifiedRecords: report.verifiedRecords,
        failedRecords: report.failedRecords,
        integrityScore: report.integrityScore,
        chainBreaksCount: report.chainBreaks.length
      }
    };

    const filename = `integrity-report-${new Date().toISOString().split('T')[0]}.${format}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');

    res.json(new ApiResponse(200, exportData, 'Integrity report exported successfully'));
  });

  /**
   * Schedule integrity verification
   * POST /api/v1/integrity/schedule
   */
  scheduleVerification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.admin!.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Access denied. Super Admin role required.');
    }

    const {
      frequency = 'DAILY',
      time = '02:00',
      enabled = true,
      notifyOnFailure = true,
      notificationEmails = []
    } = req.body;

    const schedule = {
      id: `schedule-${Date.now()}`,
      frequency,
      time,
      enabled,
      notifyOnFailure,
      notificationEmails,
      createdBy: req.admin!.id,
      createdAt: new Date(),
      nextRun: this.calculateNextRun(frequency, time)
    };

    // In a real implementation, save to database and set up cron job

    res.json(new ApiResponse(200, schedule, 'Integrity verification scheduled successfully'));
  });

  /**
   * Get scheduled verifications
   * GET /api/v1/integrity/schedules
   */
  getScheduledVerifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Mock scheduled verifications data
    const schedules = [
      {
        id: 'schedule-1',
        frequency: 'DAILY',
        time: '02:00',
        enabled: true,
        notifyOnFailure: true,
        notificationEmails: ['admin@iucb.org'],
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
        nextRun: new Date(Date.now() + 2 * 60 * 60 * 1000),
        status: 'ACTIVE'
      }
    ];

    res.json(new ApiResponse(200, schedules, 'Scheduled verifications retrieved successfully'));
  });

  /**
   * Update verification schedule
   * PATCH /api/v1/integrity/schedules/:id
   */
  updateVerificationSchedule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.admin!.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Access denied. Super Admin role required.');
    }

    const { id } = req.params;
    const updates = req.body;

    // Mock update operation
    const updatedSchedule = {
      id,
      ...updates,
      updatedBy: req.admin!.id,
      updatedAt: new Date()
    };

    res.json(new ApiResponse(200, updatedSchedule, 'Verification schedule updated successfully'));
  });

  // Helper methods

  private calculateOverallHealth(statistics: any): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
    const { failureRate, coveragePercentage } = statistics;

    if (failureRate === 0 && coveragePercentage >= 95) return 'EXCELLENT';
    if (failureRate < 1 && coveragePercentage >= 90) return 'GOOD';
    if (failureRate < 5 && coveragePercentage >= 80) return 'FAIR';
    return 'POOR';
  }

  private generateRecommendations(statistics: any): string[] {
    const recommendations: string[] = [];
    const { failureRate, coveragePercentage, chainBreaks } = statistics;

    if (failureRate > 5) {
      recommendations.push('High integrity failure rate detected. Investigate potential system issues.');
    }

    if (coveragePercentage < 90) {
      recommendations.push('Low verification coverage. Consider running more frequent integrity checks.');
    }

    if (chainBreaks > 0) {
      recommendations.push('Hash chain breaks detected. Run full chain repair to restore integrity.');
    }

    if (statistics.recentChecks === 0) {
      recommendations.push('No recent integrity checks performed. Schedule regular verification.');
    }

    if (recommendations.length === 0) {
      recommendations.push('System integrity is healthy. Continue current monitoring practices.');
    }

    return recommendations;
  }

  private calculateNextRun(frequency: string, time: string): Date {
    const now = new Date();
    const nextRun = new Date();
    const [hours, minutes] = time.split(':').map(Number);

    nextRun.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case 'HOURLY':
        if (nextRun <= now) {
          nextRun.setHours(nextRun.getHours() + 1);
        }
        break;
      case 'DAILY':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;
      case 'WEEKLY':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7);
        }
        break;
      default:
        nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun;
  }
}

export default new IntegrityVerificationController();