import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/audit.middleware.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import BulkOperationsService from '../services/bulk-operations.service.js';
import { AuditSeverity } from '@prisma/client';
import Database from '../config/Database.js';
import { z } from 'zod';

const db = Database;

// Validation schemas for bulk operations
const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one ID is required').max(100, 'Maximum 100 items per batch'),
  data: z.object({}).passthrough().optional(),
});

const bulkStatusUpdateSchema = z.object({
  updates: z.array(z.object({
    id: z.string().uuid(),
    status: z.string(),
  })).min(1, 'At least one update is required').max(100, 'Maximum 100 items per batch'),
});

const bulkApproveRejectSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one ID is required').max(100, 'Maximum 100 items per batch'),
  reason: z.string().optional(),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one ID is required').max(50, 'Maximum 50 items per batch'),
  permanent: z.boolean().default(false),
});

export class BulkOperationsController {
  // Bulk update organizations
  bulkUpdateOrganizations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { ids, data } = bulkUpdateSchema.parse(req.body);

    if (!req.admin) {
      throw new ApiError(401, 'Authentication required');
    }

    // Fetch existing organizations
    const existingOrgs = await db.organization.findMany({
      where: { id: { in: ids }, deletedAt: null }
    });

    if (existingOrgs.length !== ids.length) {
      throw new ApiError(404, 'One or more organizations not found');
    }

    const updates = existingOrgs.map(org => ({
      id: org.id,
      data,
      oldData: org
    }));

    const results = await BulkOperationsService.bulkUpdate(
      {
        adminId: req.admin.id,
        adminName: req.admin.fullName,
        adminRole: req.admin.role,
        ipAddress: req.auditContext?.ipAddress,
        userAgent: req.auditContext?.userAgent,
        sessionId: req.auditContext?.sessionId,
        requestId: req.auditContext?.requestId,
      },
      {
        entityType: 'ORGANIZATION',
        module: 'Organizations',
        description: 'Bulk update organizations',
        severity: AuditSeverity.MEDIUM,
      },
      updates,
      async (id, updateData) => {
        return await db.organization.update({
          where: { id },
          data: updateData,
        });
      }
    );

    res.json(new ApiResponse(200, { organizations: results, count: results.length }, 'Organizations updated successfully'));
  });

  // Bulk update organization status
  bulkUpdateOrganizationStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { updates } = bulkStatusUpdateSchema.parse(req.body);

    if (!req.admin) {
      throw new ApiError(401, 'Authentication required');
    }

    // Fetch existing organizations to get old status
    const existingOrgs = await db.organization.findMany({
      where: { 
        id: { in: updates.map(u => u.id) }, 
        deletedAt: null 
      }
    });

    const statusUpdates = updates.map(update => {
      const existing = existingOrgs.find(org => org.id === update.id);
      return {
        id: update.id,
        status: update.status,
        oldStatus: existing?.accreditationStatus
      };
    });

    const results = await BulkOperationsService.bulkStatusUpdate(
      {
        adminId: req.admin.id,
        adminName: req.admin.fullName,
        adminRole: req.admin.role,
        ipAddress: req.auditContext?.ipAddress,
        userAgent: req.auditContext?.userAgent,
        sessionId: req.auditContext?.sessionId,
        requestId: req.auditContext?.requestId,
      },
      {
        entityType: 'ORGANIZATION',
        module: 'Organizations',
        description: 'Bulk update organization status',
        severity: AuditSeverity.HIGH,
      },
      statusUpdates,
      async (id, status) => {
        return await db.organization.update({
          where: { id },
          data: { accreditationStatus: status as any },
        });
      }
    );

    res.json(new ApiResponse(200, { organizations: results, count: results.length }, 'Organization statuses updated successfully'));
  });

  // Bulk approve applications
  bulkApproveApplications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { ids, reason } = bulkApproveRejectSchema.parse(req.body);

    if (!req.admin) {
      throw new ApiError(401, 'Authentication required');
    }

    const results = await BulkOperationsService.bulkApprove(
      {
        adminId: req.admin.id,
        adminName: req.admin.fullName,
        adminRole: req.admin.role,
        ipAddress: req.auditContext?.ipAddress,
        userAgent: req.auditContext?.userAgent,
        sessionId: req.auditContext?.sessionId,
        requestId: req.auditContext?.requestId,
      },
      {
        entityType: 'APPLICATION',
        module: 'Applications',
        description: 'Bulk approve applications',
        severity: AuditSeverity.HIGH,
      },
      ids,
      async (id) => {
        return await db.application.update({
          where: { id },
          data: {
            applicationStatus: 'APPROVED',
            reviewedById: req.admin!.id,
            reviewedAt: new Date(),
            internalNotes: reason || 'Bulk approved',
          },
        });
      },
      async (id) => {
        return await db.application.findUnique({ where: { id } });
      }
    );

    res.json(new ApiResponse(200, { applications: results, count: results.length }, 'Applications approved successfully'));
  });

  // Bulk reject applications
  bulkRejectApplications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { ids, reason } = bulkApproveRejectSchema.parse(req.body);

    if (!req.admin) {
      throw new ApiError(401, 'Authentication required');
    }

    const rejections = ids.map(id => ({ id, reason }));

    const results = await BulkOperationsService.bulkReject(
      {
        adminId: req.admin.id,
        adminName: req.admin.fullName,
        adminRole: req.admin.role,
        ipAddress: req.auditContext?.ipAddress,
        userAgent: req.auditContext?.userAgent,
        sessionId: req.auditContext?.sessionId,
        requestId: req.auditContext?.requestId,
      },
      {
        entityType: 'APPLICATION',
        module: 'Applications',
        description: 'Bulk reject applications',
        severity: AuditSeverity.HIGH,
      },
      rejections,
      async (id, rejectionReason) => {
        return await db.application.update({
          where: { id },
          data: {
            applicationStatus: 'REJECTED',
            reviewedById: req.admin!.id,
            reviewedAt: new Date(),
            internalNotes: rejectionReason || 'Bulk rejected',
          },
        });
      },
      async (id) => {
        return await db.application.findUnique({ where: { id } });
      }
    );

    res.json(new ApiResponse(200, { applications: results, count: results.length }, 'Applications rejected successfully'));
  });

  // Bulk delete credentials
  bulkDeleteCredentials = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { ids, permanent } = bulkDeleteSchema.parse(req.body);

    if (!req.admin) {
      throw new ApiError(401, 'Authentication required');
    }

    if (permanent && req.admin.role !== 'SUPER_ADMIN') {
      throw new ApiError(403, 'Only Super Admins can permanently delete records');
    }

    await BulkOperationsService.bulkDelete(
      {
        adminId: req.admin.id,
        adminName: req.admin.fullName,
        adminRole: req.admin.role,
        ipAddress: req.auditContext?.ipAddress,
        userAgent: req.auditContext?.userAgent,
        sessionId: req.auditContext?.sessionId,
        requestId: req.auditContext?.requestId,
      },
      {
        entityType: 'CREDENTIAL',
        module: 'Credentials',
        description: permanent ? 'Bulk permanent delete credentials' : 'Bulk soft delete credentials',
        severity: permanent ? AuditSeverity.CRITICAL : AuditSeverity.HIGH,
      },
      ids,
      async (id) => {
        if (permanent) {
          await db.credential.delete({ where: { id } });
        } else {
          await db.credential.update({
            where: { id },
            data: { deletedAt: new Date() }
          });
        }
      },
      async (id) => {
        return await db.credential.findUnique({ where: { id } });
      }
    );

    res.json(new ApiResponse(200, { count: ids.length }, `Credentials ${permanent ? 'permanently ' : ''}deleted successfully`));
  });

  // Bulk send credential emails
  bulkSendCredentialEmails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { ids } = bulkApproveRejectSchema.parse(req.body);

    if (!req.admin) {
      throw new ApiError(401, 'Authentication required');
    }

    // Fetch credentials with certificates
    const credentials = await db.credential.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
        certificateGenerated: true,
      },
      include: {
        organization: true,
        auditor: true,
      },
    });

    if (credentials.length === 0) {
      throw new ApiError(404, 'No credentials with generated certificates found');
    }

    const emailOperations = credentials.map(credential => ({
      entityId: credential.id,
      recipient: credential.organization?.email || credential.auditor?.email || '',
      subject: `IUCB Credential Certificate - ${credential.credentialId}`,
      template: 'CERTIFICATE_EMAIL',
    }));

    await BulkOperationsService.bulkSendEmails(
      {
        adminId: req.admin.id,
        adminName: req.admin.fullName,
        adminRole: req.admin.role,
        ipAddress: req.auditContext?.ipAddress,
        userAgent: req.auditContext?.userAgent,
        sessionId: req.auditContext?.sessionId,
        requestId: req.auditContext?.requestId,
      },
      {
        entityType: 'CREDENTIAL',
        module: 'Credentials',
        description: 'Bulk send credential emails',
        severity: AuditSeverity.MEDIUM,
      },
      emailOperations,
      async (operation) => {
        // Create email log
        await db.emailLog.create({
          data: {
            credentialId: operation.entityId,
            recipient: operation.recipient,
            subject: operation.subject,
            template: operation.template,
            status: 'SENT',
          },
        });
      }
    );

    res.json(new ApiResponse(200, { count: credentials.length }, 'Credential emails sent successfully'));
  });

  // Bulk update advisor status
  bulkUpdateAdvisorStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { updates } = bulkStatusUpdateSchema.parse(req.body);

    if (!req.admin) {
      throw new ApiError(401, 'Authentication required');
    }

    // Fetch existing advisors
    const existingAdvisors = await db.advisor.findMany({
      where: { 
        id: { in: updates.map(u => u.id) }, 
        deletedAt: null 
      }
    });

    const statusUpdates = updates.map(update => {
      const existing = existingAdvisors.find(advisor => advisor.id === update.id);
      return {
        id: update.id,
        status: update.status,
        oldStatus: existing?.status
      };
    });

    const results = await BulkOperationsService.bulkStatusUpdate(
      {
        adminId: req.admin.id,
        adminName: req.admin.fullName,
        adminRole: req.admin.role,
        ipAddress: req.auditContext?.ipAddress,
        userAgent: req.auditContext?.userAgent,
        sessionId: req.auditContext?.sessionId,
        requestId: req.auditContext?.requestId,
      },
      {
        entityType: 'ADVISOR',
        module: 'Advisory',
        description: 'Bulk update advisor status',
        severity: AuditSeverity.MEDIUM,
      },
      statusUpdates,
      async (id, status) => {
        return await db.advisor.update({
          where: { id },
          data: { status: status as any },
        });
      }
    );

    res.json(new ApiResponse(200, { advisors: results, count: results.length }, 'Advisor statuses updated successfully'));
  });

  // Bulk update credential status
  bulkUpdateCredentialStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { updates } = bulkStatusUpdateSchema.parse(req.body);

    if (!req.admin) {
      throw new ApiError(401, 'Authentication required');
    }

    // Fetch existing credentials
    const existingCredentials = await db.credential.findMany({
      where: { 
        id: { in: updates.map(u => u.id) }, 
        deletedAt: null 
      }
    });

    const statusUpdates = updates.map(update => {
      const existing = existingCredentials.find(cred => cred.id === update.id);
      return {
        id: update.id,
        status: update.status,
        oldStatus: existing?.status
      };
    });

    const results = await BulkOperationsService.bulkStatusUpdate(
      {
        adminId: req.admin.id,
        adminName: req.admin.fullName,
        adminRole: req.admin.role,
        ipAddress: req.auditContext?.ipAddress,
        userAgent: req.auditContext?.userAgent,
        sessionId: req.auditContext?.sessionId,
        requestId: req.auditContext?.requestId,
      },
      {
        entityType: 'CREDENTIAL',
        module: 'Credentials',
        description: 'Bulk update credential status',
        severity: AuditSeverity.HIGH,
      },
      statusUpdates,
      async (id, status) => {
        return await db.credential.update({
          where: { id },
          data: { status: status as any },
        });
      }
    );

    res.json(new ApiResponse(200, { credentials: results, count: results.length }, 'Credential statuses updated successfully'));
  });

  // Get bulk operation history
  getBulkOperationHistory = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 20, entityType, dateFrom, dateTo } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {
      action: { in: ['BULK_UPDATE', 'BULK_DELETE'] }
    };

    if (entityType) where.entityType = entityType;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
      if (dateTo) where.createdAt.lte = new Date(dateTo as string);
    }

    const [operations, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      db.auditLog.count({ where }),
    ]);

    res.json(new ApiResponse(200, {
      operations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
        hasNext: Number(page) < Math.ceil(total / Number(limit)),
        hasPrev: Number(page) > 1,
      }
    }, 'Bulk operation history retrieved successfully'));
  });
}

export default new BulkOperationsController();