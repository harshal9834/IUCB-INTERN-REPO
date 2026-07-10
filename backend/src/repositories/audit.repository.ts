import Database from '../config/Database.js';
import { AuditAction, AuditSeverity, AdminRole, AlertType, AlertStatus } from '@prisma/client';

export interface CreateAuditLogData {
  actorId?: string;
  actorName?: string;
  actorRole?: AdminRole;
  entityType: string;
  entityId: string;
  action: AuditAction;
  module: string;
  description: string;
  oldValues?: any;
  newValues?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  sessionId?: string;
  requestId?: string;
  status?: string;
  severity?: AuditSeverity;
  riskScore?: number;
}

export interface AuditLogFilters {
  actorId?: string;
  entityType?: string;
  action?: AuditAction;
  module?: string;
  severity?: AuditSeverity;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  ipAddress?: string;
  sessionId?: string;
  search?: string;
}

export interface CreateAuditAlertData {
  auditLogId?: string;
  alertType: AlertType;
  severity: AuditSeverity;
  title: string;
  description: string;
  metadata?: any;
  assignedTo?: string;
}

export class AuditRepository {
  private db = Database;

  async createAuditLog(data: CreateAuditLogData) {
    return await this.db.auditLog.create({
      data: {
        ...data,
        oldValues: data.oldValues ? JSON.stringify(data.oldValues) : undefined,
        newValues: data.newValues ? JSON.stringify(data.newValues) : undefined,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          }
        }
      }
    });
  }

  async getAuditLogs(filters: AuditLogFilters, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters.actorId) where.actorId = filters.actorId;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.action) where.action = filters.action;
    if (filters.module) where.module = filters.module;
    if (filters.severity) where.severity = filters.severity;
    if (filters.status) where.status = filters.status;
    if (filters.ipAddress) where.ipAddress = filters.ipAddress;
    if (filters.sessionId) where.sessionId = filters.sessionId;

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    if (filters.search) {
      where.OR = [
        { description: { contains: filters.search, mode: 'insensitive' } },
        { actorName: { contains: filters.search, mode: 'insensitive' } },
        { entityType: { contains: filters.search, mode: 'insensitive' } },
        { module: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      this.db.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            }
          },
          alerts: {
            where: { status: AlertStatus.ACTIVE },
            select: {
              id: true,
              alertType: true,
              severity: true,
              title: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.db.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    };
  }

  async getAuditLogById(id: string) {
    return await this.db.auditLog.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          }
        },
        snapshots: {
          orderBy: { timestamp: 'desc' }
        },
        alerts: true,
      }
    });
  }

  async getEntityHistory(entityType: string, entityId: string) {
    return await this.db.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
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
    });
  }

  async createAuditSnapshot(auditLogId: string, entityType: string, entityId: string, snapshot: any) {
    return await this.db.auditSnapshot.create({
      data: {
        auditLogId,
        entityType,
        entityId,
        snapshot: JSON.stringify(snapshot),
      }
    });
  }

  async createAuditAlert(data: CreateAuditAlertData) {
    return await this.db.auditAlert.create({
      data: {
        ...data,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
      include: {
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });
  }

  async getActiveAlerts() {
    return await this.db.auditAlert.findMany({
      where: { status: AlertStatus.ACTIVE },
      include: {
        auditLog: {
          select: {
            id: true,
            entityType: true,
            entityId: true,
            action: true,
            createdAt: true,
          }
        },
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async acknowledgeAlert(alertId: string, adminId: string) {
    return await this.db.auditAlert.update({
      where: { id: alertId },
      data: {
        status: AlertStatus.ACKNOWLEDGED,
        assignedTo: adminId,
      }
    });
  }

  async resolveAlert(alertId: string, adminId: string) {
    return await this.db.auditAlert.update({
      where: { id: alertId },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedBy: adminId,
        resolvedAt: new Date(),
      }
    });
  }

  async getAuditStats(dateFrom?: Date, dateTo?: Date) {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [
      totalLogs,
      logsByAction,
      logsBySeverity,
      logsByModule,
      activeAlerts,
      criticalAlerts,
      failedLogins,
    ] = await Promise.all([
      this.db.auditLog.count({ where }),
      this.db.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } }
      }),
      this.db.auditLog.groupBy({
        by: ['severity'],
        where,
        _count: { severity: true },
      }),
      this.db.auditLog.groupBy({
        by: ['module'],
        where,
        _count: { module: true },
        orderBy: { _count: { module: 'desc' } }
      }),
      this.db.auditAlert.count({
        where: { status: AlertStatus.ACTIVE }
      }),
      this.db.auditAlert.count({
        where: { 
          status: AlertStatus.ACTIVE,
          severity: AuditSeverity.CRITICAL
        }
      }),
      this.db.auditLog.count({
        where: {
          ...where,
          action: AuditAction.FAILED_LOGIN
        }
      }),
    ]);

    return {
      totalLogs,
      logsByAction,
      logsBySeverity,
      logsByModule,
      activeAlerts,
      criticalAlerts,
      failedLogins,
    };
  }

  async getMostActiveAdmins(limit: number = 10, dateFrom?: Date, dateTo?: Date) {
    const where: any = { actorId: { not: null } };
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    return await this.db.auditLog.groupBy({
      by: ['actorId', 'actorName'],
      where,
      _count: { actorId: true },
      orderBy: { _count: { actorId: 'desc' } },
      take: limit,
    });
  }

  async getActivityTimeline(limit: number = 50) {
    return await this.db.auditLog.findMany({
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
      take: limit,
    });
  }

  async createActivitySummary(adminId: string, entityType: string, action: string, date: Date) {
    return await this.db.activitySummary.upsert({
      where: {
        adminId_entityType_action_date: {
          adminId,
          entityType,
          action,
          date,
        }
      },
      create: {
        adminId,
        entityType,
        action,
        date,
        count: 1,
        lastActivity: new Date(),
      },
      update: {
        count: { increment: 1 },
        lastActivity: new Date(),
      }
    });
  }

  async getAuditIntegrity() {
    return await this.db.auditIntegrity.findFirst({
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateAuditIntegrity(chainHash: string, blockCount: number, isValid: boolean, errorMessage?: string) {
    return await this.db.auditIntegrity.create({
      data: {
        chainHash,
        blockCount,
        isValid,
        errorMessage,
      }
    });
  }

  async searchAuditLogs(query: string, limit: number = 20) {
    return await this.db.auditLog.findMany({
      where: {
        OR: [
          { description: { contains: query, mode: 'insensitive' } },
          { actorName: { contains: query, mode: 'insensitive' } },
          { entityType: { contains: query, mode: 'insensitive' } },
          { module: { contains: query, mode: 'insensitive' } },
          { entityId: { contains: query, mode: 'insensitive' } },
        ]
      },
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
      take: limit,
    });
  }
}

export default new AuditRepository();