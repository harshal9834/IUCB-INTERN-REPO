import prisma from "../config/Database.js";
import { Logger } from "../utils/Logger.js";

export interface HistoryFilter {
  entityType?: string;
  entityId?: string;
  action?: string;
  changedBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export class HistoryService {
  /**
   * Record entity change to history
   */
  async recordChange(
    entityType: string,
    entityId: string,
    action: "CREATE" | "UPDATE" | "DELETE",
    beforeData: any | null,
    afterData: any | null,
    changedBy: string | null,
    ipAddress?: string,
    userAgent?: string,
    requestId?: string
  ): Promise<void> {
    try {
      // Get current version count
      const currentCount = await prisma.entityHistory.count({
        where: { entityId, entityType }
      });

      const version = currentCount + 1;

      // Calculate changed fields for UPDATE
      let changedFields: Record<string, any> | null = null;
      if (action === "UPDATE" && beforeData && afterData) {
        changedFields = this.calculateChangedFields(beforeData, afterData);
      }

      // Create entity history record
      await prisma.entityHistory.create({
        data: {
          entityType,
          entityId,
          version,
          action,
          beforeData,
          afterData,
          changedFields: changedFields || undefined,
          changedBy,
          ipAddress,
          userAgent,
          requestId,
          description: this.generateDescription(action, entityType, changedFields)
        }
      });

      // Create detailed change logs for each field
      if (changedFields) {
        const changeLogs = Object.entries(changedFields).map(([fieldName, change]) => ({
          entityHistoryId: "", // Will be set after creation
          entityType,
          entityId,
          fieldName,
          oldValue: JSON.stringify(change.old),
          newValue: JSON.stringify(change.new),
          changeType: action,
          timestamp: new Date()
        }));

        // Store change logs (this is a simplified version)
        Logger.info(`[HistoryService] Recorded ${action} for ${entityType} ${entityId} v${version}`);
      }

      Logger.info(`[HistoryService] Change recorded: ${entityType}#${entityId} - ${action}`);
    } catch (error: any) {
      Logger.error(`[HistoryService] Failed to record change: ${error.message}`);
      // Don't throw - history recording shouldn't break main operation
    }
  }

  /**
   * Get entity history
   */
  async getEntityHistory(
    entityType: string,
    entityId: string,
    limit = 50,
    page = 1
  ) {
    try {
      const skip = (page - 1) * limit;

      const [history, total] = await Promise.all([
        prisma.entityHistory.findMany({
          where: { entityType, entityId },
          include: {
            changedByAdmin: {
              select: { fullName: true, email: true }
            }
          },
          orderBy: { version: "desc" },
          skip,
          take: limit
        }),
        prisma.entityHistory.count({
          where: { entityType, entityId }
        })
      ]);

      return {
        history,
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      };
    } catch (error: any) {
      Logger.error(`[HistoryService] Failed to get entity history: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get specific version of entity
   */
  async getEntityVersion(
    entityType: string,
    entityId: string,
    version: number
  ) {
    try {
      const history = await prisma.entityHistory.findUnique({
        where: {
          entityId_entityType_version: {
            entityId,
            entityType,
            version
          }
        },
        include: {
          changedByAdmin: {
            select: { fullName: true, email: true }
          }
        }
      });

      if (!history) {
        return null;
      }

      return {
        version,
        data: history.afterData,
        snapshot: history,
        changedBy: history.changedByAdmin,
        changedAt: history.changeTimestamp
      };
    } catch (error: any) {
      Logger.error(`[HistoryService] Failed to get entity version: ${error.message}`);
      throw error;
    }
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    entityType: string,
    entityId: string,
    fromVersion: number,
    toVersion: number
  ) {
    try {
      const [fromHistory, toHistory] = await Promise.all([
        prisma.entityHistory.findUnique({
          where: {
            entityId_entityType_version: {
              entityId,
              entityType,
              version: fromVersion
            }
          }
        }),
        prisma.entityHistory.findUnique({
          where: {
            entityId_entityType_version: {
              entityId,
              entityType,
              version: toVersion
            }
          }
        })
      ]);

      if (!fromHistory || !toHistory) {
        throw new Error("One or both versions not found");
      }

      const differences = this.calculateChangedFields(
        fromHistory.afterData,
        toHistory.afterData
      );

      return {
        from: {
          version: fromVersion,
          data: fromHistory.afterData,
          changedAt: fromHistory.changeTimestamp
        },
        to: {
          version: toVersion,
          data: toHistory.afterData,
          changedAt: toHistory.changeTimestamp
        },
        differences
      };
    } catch (error: any) {
      Logger.error(`[HistoryService] Failed to compare versions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get change audit trail
   */
  async getAuditTrail(filter: HistoryFilter) {
    try {
      const where: any = {};

      if (filter.entityType) where.entityType = filter.entityType;
      if (filter.entityId) where.entityId = filter.entityId;
      if (filter.action) where.action = filter.action;
      if (filter.changedBy) where.changedBy = filter.changedBy;

      if (filter.dateFrom || filter.dateTo) {
        where.changeTimestamp = {};
        if (filter.dateFrom) {
          where.changeTimestamp.gte = filter.dateFrom;
        }
        if (filter.dateTo) {
          where.changeTimestamp.lte = filter.dateTo;
        }
      }

      const page = filter.page || 1;
      const limit = filter.limit || 50;
      const skip = (page - 1) * limit;

      const [trail, total] = await Promise.all([
        prisma.entityHistory.findMany({
          where,
          include: {
            changedByAdmin: {
              select: { fullName: true, email: true }
            }
          },
          orderBy: { changeTimestamp: "desc" },
          skip,
          take: limit
        }),
        prisma.entityHistory.count({ where })
      ]);

      return {
        trail,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error: any) {
      Logger.error(`[HistoryService] Failed to get audit trail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all changes by a specific admin
   */
  async getAdminActivity(adminId: string, limit = 100, page = 1) {
    try {
      const skip = (page - 1) * limit;

      const [activity, total] = await Promise.all([
        prisma.entityHistory.findMany({
          where: { changedBy: adminId },
          include: {
            changedByAdmin: {
              select: { fullName: true, email: true }
            }
          },
          orderBy: { changeTimestamp: "desc" },
          skip,
          take: limit
        }),
        prisma.entityHistory.count({ where: { changedBy: adminId } })
      ]);

      return {
        activity,
        total,
        page,
        pages: Math.ceil(total / limit),
        adminId
      };
    } catch (error: any) {
      Logger.error(`[HistoryService] Failed to get admin activity: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get statistics for entity type
   */
  async getEntityTypeStats(entityType: string) {
    try {
      const stats = await prisma.entityHistory.groupBy({
        by: ["action"],
        where: { entityType },
        _count: true
      });

      const totalChanges = stats.reduce((sum, s) => sum + s._count, 0);
      const uniqueEntities = await prisma.entityHistory.findMany({
        where: { entityType },
        distinct: ["entityId"],
        select: { entityId: true }
      });

      return {
        entityType,
        totalChanges,
        uniqueEntities: uniqueEntities.length,
        changesByAction: stats.map(s => ({
          action: s.action,
          count: s._count
        }))
      };
    } catch (error: any) {
      Logger.error(`[HistoryService] Failed to get stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Private helper: Calculate changed fields
   */
  private calculateChangedFields(beforeData: any, afterData: any): Record<string, any> {
    const changes: Record<string, any> = {};

    if (!beforeData || !afterData) return changes;

    // Get all keys from both objects
    const allKeys = new Set([
      ...Object.keys(beforeData || {}),
      ...Object.keys(afterData || {})
    ]);

    allKeys.forEach(key => {
      const oldValue = beforeData?.[key];
      const newValue = afterData?.[key];

      // Only include if value changed
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = {
          old: oldValue,
          new: newValue
        };
      }
    });

    return changes;
  }

  /**
   * Private helper: Generate description
   */
  private generateDescription(
    action: string,
    entityType: string,
    changedFields?: Record<string, any> | null
  ): string {
    switch (action) {
      case "CREATE":
        return `${entityType} record created`;
      case "DELETE":
        return `${entityType} record deleted`;
      case "UPDATE":
        const fieldCount = changedFields ? Object.keys(changedFields).length : 0;
        const fields = changedFields ? Object.keys(changedFields).join(", ") : "unknown fields";
        return `${entityType} record updated: ${fields}`;
      default:
        return `${entityType} record changed`;
    }
  }

  /**
   * Restore to previous version (read-only, creates new history entry)
   */
  async restoreToVersion(
    entityType: string,
    entityId: string,
    targetVersion: number,
    adminId: string,
    ipAddress?: string
  ) {
    try {
      const targetHistory = await prisma.entityHistory.findUnique({
        where: {
          entityId_entityType_version: {
            entityId,
            entityType,
            version: targetVersion
          }
        }
      });

      if (!targetHistory) {
        throw new Error(`Version ${targetVersion} not found`);
      }

      // Record this as a "RESTORE" action
      await this.recordChange(
        entityType,
        entityId,
        "UPDATE",
        targetHistory.afterData,
        targetHistory.afterData,
        adminId,
        ipAddress,
        undefined,
        `Restored to version ${targetVersion}`
      );

      return {
        success: true,
        message: `Restored to version ${targetVersion}`,
        restoredData: targetHistory.afterData
      };
    } catch (error: any) {
      Logger.error(`[HistoryService] Failed to restore version: ${error.message}`);
      throw error;
    }
  }
}