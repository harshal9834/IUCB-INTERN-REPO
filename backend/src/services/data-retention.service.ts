import { PrismaClient, Prisma } from '@prisma/client';
import { AuditAction, AuditSeverity } from '../types/audit-enums.js';
import db from '../config/db.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';

export interface RetentionPolicy {
  id: string;
  name: string;
  description?: string;
  entityType: string;
  retentionDays: number;
  deleteAction: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: Date;
}

export interface RetentionExecutionResult {
  policyId: string;
  executedAt: Date;
  
  // Processing statistics
  recordsProcessed: number;
  recordsArchived: number;
  recordsDeleted: number;
  recordsPreserved: number;
  
  // Size statistics
  dataArchived: number; // bytes
  dataDeleted: number; // bytes
  compressionRatio?: number;
  
  // Time statistics
  executionTime: number; // milliseconds
  
  // Results
  errors: string[];
  warnings: string[];
  success: boolean;
  
  // File locations (for archived data)
  archiveFiles: string[];
}

export interface DataArchive {
  id: string;
  entityType: string;
  entityId: string;
  data: any;
  archivedAt: Date;
  archivedBy?: string;
  isRestored: boolean;
  restoredAt?: Date;
  restoredBy?: string;
  reason?: string;
  restoreInfo?: any;
}

export class DataRetentionService {
  
  private readonly ARCHIVE_BASE_PATH = path.join(process.cwd(), 'archives');
  private readonly BATCH_SIZE = 1000;
  private readonly MAX_EXECUTION_TIME = 60 * 60 * 1000; // 1 hour

  /**
   * Execute all active retention policies
   */
  async executeRetentionPolicies(): Promise<RetentionExecutionResult[]> {
    const startTime = Date.now();
    console.log('Starting retention policy execution...');
    
    try {
      const activePolicies = await this.getActivePolicies();
      const results: RetentionExecutionResult[] = [];

      for (const policy of activePolicies) {
        if (this.shouldExecutePolicy(policy)) {
          console.log(`Executing retention policy: ${policy.name}`);
          const result = await this.executeSinglePolicy(policy);
          results.push(result);
          
          // Update policy execution timestamp
          await this.updatePolicyExecution(policy.id, result);
        }
      }

      const totalTime = Date.now() - startTime;
      console.log(`Retention policy execution completed in ${totalTime}ms. Processed ${results.length} policies.`);
      
      return results;
    } catch (error) {
      console.error('Retention policy execution failed:', error);
      throw new Error('Failed to execute retention policies');
    }
  }

  /**
   * Execute a single retention policy
   */
  async executeSinglePolicy(policy: RetentionPolicy): Promise<RetentionExecutionResult> {
    const startTime = Date.now();
    const result: RetentionExecutionResult = {
      policyId: policy.id,
      executedAt: new Date(),
      recordsProcessed: 0,
      recordsArchived: 0,
      recordsDeleted: 0,
      recordsPreserved: 0,
      dataArchived: 0,
      dataDeleted: 0,
      executionTime: 0,
      errors: [],
      warnings: [],
      success: false,
      archiveFiles: []
    };

    try {
      // Calculate cutoff dates
      const deletionCutoff = new Date();
      deletionCutoff.setDate(deletionCutoff.getDate() - policy.retentionDays);
      
      const archiveCutoff = null;

      // Get records to process
      const recordsToProcess = await this.getRecordsForRetention(policy, deletionCutoff, archiveCutoff);
      result.recordsProcessed = recordsToProcess.length;

      if (recordsToProcess.length === 0) {
        result.success = true;
        result.executionTime = Date.now() - startTime;
        return result;
      }

      // Process records in batches
      const batches = this.createBatches(recordsToProcess, this.BATCH_SIZE);
      
      for (const batch of batches) {
        const batchResult = await this.processBatch(batch, policy, deletionCutoff, archiveCutoff);
        
        result.recordsArchived += batchResult.archived;
        result.recordsDeleted += batchResult.deleted;
        result.recordsPreserved += batchResult.preserved;
        result.dataArchived += batchResult.dataArchived;
        result.dataDeleted += batchResult.dataDeleted;
        result.errors.push(...batchResult.errors);
        result.warnings.push(...batchResult.warnings);
        result.archiveFiles.push(...batchResult.archiveFiles);

        // Check execution time limit
        if (Date.now() - startTime > this.MAX_EXECUTION_TIME) {
          result.warnings.push('Execution time limit reached. Some records may not have been processed.');
          break;
        }
      }

      // Calculate compression ratio
      if (result.dataArchived > 0 && result.recordsArchived > 0) {
        const estimatedOriginalSize = result.recordsArchived * 1000; // Rough estimate
        result.compressionRatio = result.dataArchived / estimatedOriginalSize;
      }

      result.success = result.errors.length === 0;
      result.executionTime = Date.now() - startTime;

      console.log(`Policy ${policy.name} execution completed: ${result.recordsProcessed} processed, ${result.recordsArchived} archived, ${result.recordsDeleted} deleted`);
      
      return result;
    } catch (error) {
      result.errors.push(`Policy execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.success = false;
      result.executionTime = Date.now() - startTime;
      return result;
    }
  }

  /**
   * Archive audit logs to long-term storage
   */
  async archiveAuditLogs(
    logs: any[], 
    policy: RetentionPolicy
  ): Promise<DataArchive> {
    try {
      // Ensure archive directory exists
      await fs.mkdir(this.ARCHIVE_BASE_PATH, { recursive: true });

      const archiveId = `${policy.id}-${Date.now()}`;
      const filename = `audit-logs-${archiveId}.json`;
      const filePath = path.join(this.ARCHIVE_BASE_PATH, filename);

      // Prepare data for archiving
      const archiveData = {
        metadata: {
          archiveId,
          policyId: policy.id,
          createdAt: new Date(),
          recordCount: logs.length
        },
        data: logs
      };

      const originalData = JSON.stringify(archiveData, null, 2);

      // Write to file
      await fs.writeFile(filePath, originalData);

      // Create archive record in database
      const archive: DataArchive = {
        id: archiveId,
        entityType: policy.entityType,
        entityId: archiveId,
        data: archiveData,
        archivedAt: new Date(),
        archivedBy: policy.createdBy,
        isRestored: false,
        reason: 'RETENTION_POLICY'
      };

      // Save archive metadata to database
      await this.saveArchiveMetadata(archive);

      console.log(`Archived ${logs.length} records to ${filePath}.`);
      
      return archive;
    } catch (error) {
      console.error('Archive creation failed:', error);
      throw new Error('Failed to create data archive');
    }
  }

  /**
   * Restore data from archive
   */
  async restoreFromArchive(archiveId: string, restoreToDatabase: boolean = false): Promise<any[]> {
    try {
      console.log(`Restoring data from archive ${archiveId}...`);

      // Get archive metadata
      const archive = await db.archivedRecord.findUnique({
        where: { id: archiveId }
      });

      if (!archive) {
        throw new Error('Archive not found');
      }

      const restoredData = archive.data as any[];

      if (restoreToDatabase) {
        // Restore to database (careful operation)
        console.log(`Restoring ${restoredData.length} records to database...`);
        
        // This would need careful implementation to avoid conflicts
        // For now, we'll just log the operation
        console.log('Database restoration would be implemented here');
      }

      console.log(`Successfully restored ${restoredData.length} records from archive`);
      
      return restoredData;
    } catch (error) {
      console.error('Archive restoration failed:', error);
      throw new Error('Failed to restore from archive');
    }
  }

  /**
   * Get retention policy dashboard data
   */
  async getRetentionDashboard(): Promise<any> {
    try {
      const [
        totalPolicies,
        activePolicies,
        totalArchives
      ] = await Promise.all([
        db.retentionPolicy.count(),
        db.retentionPolicy.count({ where: { isActive: true } }),
        db.archivedRecord.count()
      ]);

      return {
        overview: {
          totalPolicies,
          activePolicies,
          totalArchives
        }
      };
    } catch (error) {
      console.error('Error getting retention dashboard:', error);
      throw new Error('Failed to retrieve retention dashboard data');
    }
  }

  /**
   * Create or update retention policy
   */
  async createRetentionPolicy(policyData: Omit<RetentionPolicy, 'id' | 'createdAt'>): Promise<RetentionPolicy> {
    try {
      const policy = await db.retentionPolicy.create({
        data: {
          name: policyData.name,
          description: policyData.description,
          entityType: policyData.entityType,
          retentionDays: policyData.retentionDays,
          deleteAction: policyData.deleteAction,
          isActive: policyData.isActive,
          createdBy: policyData.createdBy
        }
      });

      return policy as any;
    } catch (error) {
      console.error('Error creating retention policy:', error);
      throw new Error('Failed to create retention policy');
    }
  }

  /**
   * Delete audit logs according to retention policy
   */
  async deleteExpiredRecords(policy: RetentionPolicy, cutoffDate: Date): Promise<{ deleted: number; errors: string[] }> {
    const errors: string[] = [];
    let totalDeleted = 0;

    try {
      // Get records to delete
      const recordsToDelete = await db.auditLog.findMany({
        where: {
          createdAt: { lt: cutoffDate },
          entityType: policy.entityType,
          riskScore: { lt: 7 }
        },
        select: { id: true }
      });

      // Delete in batches to avoid overwhelming the database
      const batches = this.createBatches(recordsToDelete, this.BATCH_SIZE);

      for (const batch of batches) {
        try {
          const ids = batch.map((record: any) => record.id);
          
          // Delete related records first
          await db.auditSnapshot.deleteMany({
            where: { auditLogId: { in: ids } }
          });
          
          await db.auditAlert.deleteMany({
            where: { auditLogId: { in: ids } }
          });

          // Delete main audit log records
          const result = await db.auditLog.deleteMany({
            where: { id: { in: ids } }
          });

          totalDeleted += result.count;
        } catch (error) {
          errors.push(`Batch deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`Deleted ${totalDeleted} expired audit log records`);
      
      return { deleted: totalDeleted, errors };
    } catch (error) {
      console.error('Error deleting expired records:', error);
      return { deleted: totalDeleted, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }

  // Helper methods

  private async getActivePolicies(): Promise<RetentionPolicy[]> {
    const policies = await db.retentionPolicy.findMany({
      where: { isActive: true }
    });

    return policies as any;
  }

  private shouldExecutePolicy(policy: RetentionPolicy): boolean {
    // Execute policies when active
    return policy.isActive;
  }

  private async getRecordsForRetention(
    policy: RetentionPolicy,
    deletionCutoff: Date,
    archiveCutoff?: Date | null
  ) {
    const where: any = {
      entityType: policy.entityType,
      createdAt: { lt: deletionCutoff }
    };

    return await db.auditLog.findMany({ where });
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private async processBatch(
    batch: any[],
    policy: RetentionPolicy,
    deletionCutoff: Date,
    archiveCutoff?: Date | null
  ) {
    const result = {
      archived: 0,
      deleted: 0,
      preserved: 0,
      dataArchived: 0,
      dataDeleted: 0,
      errors: [] as string[],
      warnings: [] as string[],
      archiveFiles: [] as string[]
    };

    try {
      const recordsToArchive = archiveCutoff 
        ? batch.filter(record => record.createdAt >= deletionCutoff && record.createdAt < archiveCutoff)
        : [];

      const recordsToDelete = batch.filter(record => record.createdAt < deletionCutoff);

      // Archive records
      if (recordsToArchive.length > 0) {
        try {
          const archive = await this.archiveAuditLogs(recordsToArchive, policy);
          result.archived = recordsToArchive.length;
          result.archiveFiles.push(archive.id);
        } catch (error) {
          result.errors.push(`Archive failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Delete records
      if (recordsToDelete.length > 0) {
        try {
          const deleteResult = await this.deleteExpiredRecords(policy, deletionCutoff);
          result.deleted = deleteResult.deleted;
          result.errors.push(...deleteResult.errors);
        } catch (error) {
          result.errors.push(`Deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return result;
    } catch (error) {
      result.errors.push(`Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  private async updatePolicyExecution(policyId: string, result: RetentionExecutionResult): Promise<void> {
    await db.retentionPolicy.update({
      where: { id: policyId },
      data: {
        updatedAt: result.executedAt
      }
    });
  }

  private calculateNextExecution(policy: Partial<RetentionPolicy>): Date {
    const nextExecution = new Date();
    nextExecution.setDate(nextExecution.getDate() + 1);
    return nextExecution;
  }

  private async createArchiveSearchIndex(logs: any[]): Promise<any> {
    return {};
  }

  private async saveArchiveMetadata(archive: DataArchive): Promise<void> {
    await db.archivedRecord.create({
      data: {
        entityType: archive.entityType,
        entityId: archive.entityId,
        data: archive.data,
        archivedAt: archive.archivedAt,
        archivedBy: archive.archivedBy,
        isRestored: archive.isRestored,
        restoredAt: archive.restoredAt,
        restoredBy: archive.restoredBy,
        reason: archive.reason,
        restoreInfo: archive.restoreInfo
      }
    });
  }

  private async getRecentExecutions(days: number): Promise<any[]> {
    // Simplified - return empty for now
    return [];
  }

  private async getUpcomingExecutions(days: number): Promise<any[]> {
    // Simplified - return empty for now
    return [];
  }

  private async getStorageDistribution(): Promise<any> {
    // Simplified - return empty for now
    return {};
  }

  private async calculateRetentionCompliance(): Promise<any> {
    // Simplified - return default for now
    return { compliant: true };
  }
}

export default new DataRetentionService();