import AuditService, { EntityChange } from './audit.service.js';
import { AuditAction, AuditSeverity, AdminRole } from '@prisma/client';
import Database from '../config/Database.js';

export interface BulkOperationContext {
  adminId: string;
  adminName: string;
  adminRole: AdminRole;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
}

export interface BulkUpdateConfig {
  entityType: string;
  module: string;
  description: string;
  severity: AuditSeverity;
}

export class BulkOperationsService {
  private db = Database;

  // Bulk create operation with automatic audit logging
  async bulkCreate<T>(
    context: BulkOperationContext,
    config: BulkUpdateConfig,
    entities: any[],
    createFunction: (data: any) => Promise<T>
  ): Promise<T[]> {
    const results: T[] = [];
    const changes: EntityChange[] = [];

    try {
      for (const entityData of entities) {
        const result = await createFunction(entityData);
        results.push(result);

        changes.push({
          entityType: config.entityType,
          entityId: (result as any).id || 'bulk-create',
          action: AuditAction.CREATE,
          newValues: entityData,
        });
      }

      // Log bulk operation
      await AuditService.logBulkAudit(
        {
          adminId: context.adminId,
          adminName: context.adminName,
          adminRole: context.adminRole,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
          requestId: context.requestId,
        },
        changes,
        config.module
      );

      return results;
    } catch (error) {
      console.error('Bulk create operation failed:', error);
      throw error;
    }
  }

  // Bulk update operation with automatic audit logging
  async bulkUpdate<T>(
    context: BulkOperationContext,
    config: BulkUpdateConfig,
    updates: Array<{ id: string; data: any; oldData?: any }>,
    updateFunction: (id: string, data: any) => Promise<T>
  ): Promise<T[]> {
    const results: T[] = [];
    const changes: EntityChange[] = [];

    try {
      for (const update of updates) {
        const result = await updateFunction(update.id, update.data);
        results.push(result);

        changes.push({
          entityType: config.entityType,
          entityId: update.id,
          action: AuditAction.BULK_UPDATE,
          oldValues: update.oldData,
          newValues: update.data,
        });
      }

      // Log bulk operation
      await AuditService.logBulkAudit(
        {
          adminId: context.adminId,
          adminName: context.adminName,
          adminRole: context.adminRole,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
          requestId: context.requestId,
        },
        changes,
        config.module
      );

      return results;
    } catch (error) {
      console.error('Bulk update operation failed:', error);
      throw error;
    }
  }

  // Bulk delete operation with automatic audit logging
  async bulkDelete(
    context: BulkOperationContext,
    config: BulkUpdateConfig,
    ids: string[],
    deleteFunction: (id: string) => Promise<void>,
    getEntityFunction?: (id: string) => Promise<any>
  ): Promise<void> {
    const changes: EntityChange[] = [];

    try {
      for (const id of ids) {
        let oldData: any = undefined;

        // Fetch existing data if function provided
        if (getEntityFunction) {
          try {
            oldData = await getEntityFunction(id);
          } catch (error) {
            console.warn(`Could not fetch entity ${id} for audit:`, error);
          }
        }

        await deleteFunction(id);

        changes.push({
          entityType: config.entityType,
          entityId: id,
          action: AuditAction.BULK_DELETE,
          oldValues: oldData,
          newValues: { deletedAt: new Date() },
        });
      }

      // Log bulk operation
      await AuditService.logBulkAudit(
        {
          adminId: context.adminId,
          adminName: context.adminName,
          adminRole: context.adminRole,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
          requestId: context.requestId,
        },
        changes,
        config.module
      );
    } catch (error) {
      console.error('Bulk delete operation failed:', error);
      throw error;
    }
  }

  // Bulk status update operation with automatic audit logging
  async bulkStatusUpdate<T>(
    context: BulkOperationContext,
    config: BulkUpdateConfig,
    statusUpdates: Array<{ id: string; status: string; oldStatus?: string }>,
    updateFunction: (id: string, status: string) => Promise<T>
  ): Promise<T[]> {
    const results: T[] = [];
    const changes: EntityChange[] = [];

    try {
      for (const statusUpdate of statusUpdates) {
        const result = await updateFunction(statusUpdate.id, statusUpdate.status);
        results.push(result);

        changes.push({
          entityType: config.entityType,
          entityId: statusUpdate.id,
          action: AuditAction.STATUS_CHANGE,
          oldValues: { status: statusUpdate.oldStatus },
          newValues: { status: statusUpdate.status },
        });
      }

      // Log bulk operation
      await AuditService.logBulkAudit(
        {
          adminId: context.adminId,
          adminName: context.adminName,
          adminRole: context.adminRole,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
          requestId: context.requestId,
        },
        changes,
        config.module
      );

      return results;
    } catch (error) {
      console.error('Bulk status update operation failed:', error);
      throw error;
    }
  }

  // Bulk email send operation with automatic audit logging
  async bulkSendEmails(
    context: BulkOperationContext,
    config: BulkUpdateConfig,
    emailOperations: Array<{ entityId: string; recipient: string; subject: string; template: string }>,
    sendEmailFunction: (operation: any) => Promise<void>
  ): Promise<void> {
    const changes: EntityChange[] = [];

    try {
      for (const emailOp of emailOperations) {
        await sendEmailFunction(emailOp);

        changes.push({
          entityType: config.entityType,
          entityId: emailOp.entityId,
          action: AuditAction.SEND_EMAIL,
          newValues: {
            recipient: emailOp.recipient,
            subject: emailOp.subject,
            template: emailOp.template,
            sentAt: new Date(),
          },
        });
      }

      // Log bulk operation
      await AuditService.logBulkAudit(
        {
          adminId: context.adminId,
          adminName: context.adminName,
          adminRole: context.adminRole,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
          requestId: context.requestId,
        },
        changes,
        config.module
      );
    } catch (error) {
      console.error('Bulk email operation failed:', error);
      throw error;
    }
  }

  // Bulk approve operation with automatic audit logging
  async bulkApprove<T>(
    context: BulkOperationContext,
    config: BulkUpdateConfig,
    ids: string[],
    approveFunction: (id: string) => Promise<T>,
    getEntityFunction?: (id: string) => Promise<any>
  ): Promise<T[]> {
    const results: T[] = [];
    const changes: EntityChange[] = [];

    try {
      for (const id of ids) {
        let oldData: any = undefined;

        // Fetch existing data if function provided
        if (getEntityFunction) {
          try {
            oldData = await getEntityFunction(id);
          } catch (error) {
            console.warn(`Could not fetch entity ${id} for audit:`, error);
          }
        }

        const result = await approveFunction(id);
        results.push(result);

        changes.push({
          entityType: config.entityType,
          entityId: id,
          action: AuditAction.APPROVE,
          oldValues: oldData,
          newValues: result,
        });
      }

      // Log bulk operation
      await AuditService.logBulkAudit(
        {
          adminId: context.adminId,
          adminName: context.adminName,
          adminRole: context.adminRole,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
          requestId: context.requestId,
        },
        changes,
        config.module
      );

      return results;
    } catch (error) {
      console.error('Bulk approve operation failed:', error);
      throw error;
    }
  }

  // Bulk reject operation with automatic audit logging
  async bulkReject<T>(
    context: BulkOperationContext,
    config: BulkUpdateConfig,
    rejections: Array<{ id: string; reason?: string }>,
    rejectFunction: (id: string, reason?: string) => Promise<T>,
    getEntityFunction?: (id: string) => Promise<any>
  ): Promise<T[]> {
    const results: T[] = [];
    const changes: EntityChange[] = [];

    try {
      for (const rejection of rejections) {
        let oldData: any = undefined;

        // Fetch existing data if function provided
        if (getEntityFunction) {
          try {
            oldData = await getEntityFunction(rejection.id);
          } catch (error) {
            console.warn(`Could not fetch entity ${rejection.id} for audit:`, error);
          }
        }

        const result = await rejectFunction(rejection.id, rejection.reason);
        results.push(result);

        changes.push({
          entityType: config.entityType,
          entityId: rejection.id,
          action: AuditAction.REJECT,
          oldValues: oldData,
          newValues: { 
            ...(result as any), 
            rejectionReason: rejection.reason 
          },
        });
      }

      // Log bulk operation
      await AuditService.logBulkAudit(
        {
          adminId: context.adminId,
          adminName: context.adminName,
          adminRole: context.adminRole,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
          requestId: context.requestId,
        },
        changes,
        config.module
      );

      return results;
    } catch (error) {
      console.error('Bulk reject operation failed:', error);
      throw error;
    }
  }

  // Generic bulk operation with custom audit logging
  async bulkOperation<T>(
    context: BulkOperationContext,
    config: BulkUpdateConfig,
    operations: Array<{ id: string; action: AuditAction; data?: any; oldData?: any }>,
    executeFunction: (operation: any) => Promise<T>
  ): Promise<T[]> {
    const results: T[] = [];
    const changes: EntityChange[] = [];

    try {
      for (const operation of operations) {
        const result = await executeFunction(operation);
        results.push(result);

        changes.push({
          entityType: config.entityType,
          entityId: operation.id,
          action: operation.action,
          oldValues: operation.oldData,
          newValues: operation.data || result,
        });
      }

      // Log bulk operation
      await AuditService.logBulkAudit(
        {
          adminId: context.adminId,
          adminName: context.adminName,
          adminRole: context.adminRole,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          sessionId: context.sessionId,
          requestId: context.requestId,
        },
        changes,
        config.module
      );

      return results;
    } catch (error) {
      console.error('Bulk operation failed:', error);
      throw error;
    }
  }
}

export default new BulkOperationsService();