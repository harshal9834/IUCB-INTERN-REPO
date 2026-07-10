import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/audit.middleware.js';
import DataRetentionService, { RetentionPolicy } from '../services/data-retention.service.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { AdminRole } from '@prisma/client';
import { body, param, query, validationResult } from 'express-validator';
import db from '../config/db.js';

export class DataRetentionController {

  /**
   * Get retention dashboard
   * GET /api/v1/retention/dashboard
   */
  getRetentionDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const dashboard = await DataRetentionService.getRetentionDashboard();

    res.json(new ApiResponse(200, dashboard, 'Retention dashboard retrieved successfully'));
  });

  /**
   * Execute retention policies
   * POST /api/v1/retention/execute
   */
  executeRetentionPolicies = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.admin!.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Access denied. Super Admin role required for retention execution.');
    }

    const results = await DataRetentionService.executeRetentionPolicies();

    const summary = {
      policiesExecuted: results.length,
      totalRecordsProcessed: results.reduce((sum, r) => sum + r.recordsProcessed, 0),
      totalRecordsArchived: results.reduce((sum, r) => sum + r.recordsArchived, 0),
      totalRecordsDeleted: results.reduce((sum, r) => sum + r.recordsDeleted, 0),
      totalDataArchived: results.reduce((sum, r) => sum + r.dataArchived, 0),
      totalDataDeleted: results.reduce((sum, r) => sum + r.dataDeleted, 0),
      executionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
      errors: results.flatMap(r => r.errors),
      warnings: results.flatMap(r => r.warnings)
    };

    res.json(new ApiResponse(200, {
      summary,
      detailedResults: results
    }, 'Retention policies executed successfully'));
  });

  /**
   * Get retention policies
   * GET /api/v1/retention/policies
   */
  getRetentionPolicies = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      page = 1,
      limit = 20,
      isActive,
      entityType
    } = req.query;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (entityType) where.entityType = entityType;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [policies, totalCount] = await Promise.all([
      db.retentionPolicy.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, fullName: true, email: true }
          }
        }
      }),
      db.retentionPolicy.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json(new ApiResponse(200, {
      policies,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    }, 'Retention policies retrieved successfully'));
  });

  /**
   * Create retention policy
   * POST /api/v1/retention/policies
   */
  createRetentionPolicy = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation error', errors.array());
    }

    if (req.admin!.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Access denied. Super Admin role required for policy creation.');
    }

    const policyData = {
      ...req.body,
      createdBy: req.admin!.id
    };

    const policy = await DataRetentionService.createRetentionPolicy(policyData);

    res.status(201).json(new ApiResponse(201, policy, 'Retention policy created successfully'));
  });

  /**
   * Update retention policy
   * PATCH /api/v1/retention/policies/:id
   */
  updateRetentionPolicy = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (req.admin!.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Access denied. Super Admin role required.');
    }

    const policy = await db.retentionPolicy.findUnique({
      where: { id }
    });

    if (!policy) {
      throw new ApiError(404, 'Retention policy not found');
    }

    const updatedPolicy = await db.retentionPolicy.update({
      where: { id },
      data: {
        ...req.body,
        updatedAt: new Date()
      }
    });

    res.json(new ApiResponse(200, updatedPolicy, 'Retention policy updated successfully'));
  });

  /**
   * Delete retention policy
   * DELETE /api/v1/retention/policies/:id
   */
  deleteRetentionPolicy = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (req.admin!.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Access denied. Super Admin role required.');
    }

    const policy = await db.retentionPolicy.findUnique({
      where: { id }
    });

    if (!policy) {
      throw new ApiError(404, 'Retention policy not found');
    }

    await db.retentionPolicy.delete({
      where: { id }
    });

    res.json(new ApiResponse(200, null, 'Retention policy deleted successfully'));
  });

  /**
   * Get archives
   * GET /api/v1/retention/archives
   */
  getArchives = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      page = 1,
      limit = 20,
      entityType,
      dateFrom,
      dateTo
    } = req.query;

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (dateFrom || dateTo) {
      where.archivedAt = {};
      if (dateFrom) where.archivedAt.gte = new Date(dateFrom as string);
      if (dateTo) where.archivedAt.lte = new Date(dateTo as string);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [archives, totalCount] = await Promise.all([
      db.archivedRecord.findMany({
        where,
        skip,
        take,
        orderBy: { archivedAt: 'desc' }
      }),
      db.archivedRecord.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / take);

    res.json(new ApiResponse(200, {
      archives,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalCount,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      }
    }, 'Archives retrieved successfully'));
  });

  /**
   * Restore from archive
   * POST /api/v1/retention/archives/:id/restore
   */
  restoreFromArchive = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { restoreToDatabase = false } = req.body;

    if (req.admin!.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Access denied. Super Admin role required for restoration.');
    }

    const restoredData = await DataRetentionService.restoreFromArchive(id, restoreToDatabase);

    res.json(new ApiResponse(200, {
      archiveId: id,
      recordsRestored: Array.isArray(restoredData) ? restoredData.length : 1,
      restoredToDatabase: restoreToDatabase,
      data: restoreToDatabase ? null : restoredData
    }, 'Data restored from archive successfully'));
  });

  /**
   * Get archive details
   * GET /api/v1/retention/archives/:id
   */
  getArchiveDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const archive = await db.archivedRecord.findUnique({
      where: { id }
    });

    if (!archive) {
      throw new ApiError(404, 'Archive not found');
    }

    res.json(new ApiResponse(200, archive, 'Archive details retrieved successfully'));
  });

  /**
   * Download archive file
   * GET /api/v1/retention/archives/:id/download
   */
  downloadArchive = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const archive = await db.archivedRecord.findUnique({
      where: { id }
    });

    if (!archive) {
      throw new ApiError(404, 'Archive not found');
    }

    // Return archive data as JSON
    const fileName = `archive-${id}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/json');

    res.json(new ApiResponse(200, archive.data, 'Archive file data retrieved'));
  });

  /**
   * Get retention analytics
   * GET /api/v1/retention/analytics
   */
  getRetentionAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalArchives,
      recentArchives,
      policyStats
    ] = await Promise.all([
      db.archivedRecord.count(),
      db.archivedRecord.count({
        where: { archivedAt: { gte: thirtyDaysAgo } }
      }),
      db.retentionPolicy.groupBy({
        by: ['isActive'],
        _count: true
      })
    ]);

    const analytics = {
      overview: {
        totalArchives,
        recentArchives: recentArchives || 0,
        totalRecordsArchived: totalArchives || 0
      },
      policyStats: policyStats.map((stat: any) => ({
        status: stat.isActive ? 'Active' : 'Inactive',
        count: stat._count
      }))
    };

    res.json(new ApiResponse(200, analytics, 'Retention analytics retrieved successfully'));
  });

  /**
   * Test retention policy
   * POST /api/v1/retention/policies/:id/test
   */
  testRetentionPolicy = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { dryRun = true } = req.body;

    if (req.admin!.role !== AdminRole.SUPER_ADMIN) {
      throw new ApiError(403, 'Access denied. Super Admin role required.');
    }

    const policy = await db.retentionPolicy.findUnique({
      where: { id }
    });

    if (!policy) {
      throw new ApiError(404, 'Retention policy not found');
    }

    // Calculate what would happen if policy was executed
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    const recordsToProcess = await db.auditLog.count({
      where: {
        entityType: policy.entityType,
        createdAt: { lt: cutoffDate }
      }
    });

    const testResult = {
      policyId: id,
      policyName: policy.name,
      cutoffDate,
      recordsAffected: recordsToProcess,
      estimatedArchiveSize: recordsToProcess * 1000,
      wouldDelete: policy.deleteAction === 'HARD_DELETE' ? recordsToProcess : 0,
      wouldArchive: policy.deleteAction === 'ARCHIVE' ? recordsToProcess : 0,
      dryRun,
      testedAt: new Date(),
      testedBy: req.admin!.id
    };

    res.json(new ApiResponse(200, testResult, 'Retention policy test completed'));
  });
}

// Validation schemas
export const createPolicyValidation = [
  body('name').notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('entityTypes').isArray().notEmpty(),
  body('retentionPeriodDays').isInt({ min: 1, max: 3650 }),
  body('archiveAfterDays').optional().isInt({ min: 1 }),
  body('compressionEnabled').optional().isBoolean(),
  body('encryptionEnabled').optional().isBoolean(),
  body('legalHoldExempt').optional().isBoolean(),
  body('complianceStandards').optional().isArray(),
  body('isActive').optional().isBoolean()
];

export const policyIdValidation = [
  param('id').notEmpty().isUUID()
];

export const archiveIdValidation = [
  param('id').notEmpty().isString()
];

export default new DataRetentionController();
