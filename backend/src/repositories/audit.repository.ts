// ============================================================
// Audit Repository – reads directly from the AuditLog table.
// Every method issues a fresh Prisma query – no caching.
// ============================================================

import prisma from '../config/Database.js';
import type { Prisma } from '@prisma/client';
import type { AuditQueryParams, RawAuditLog } from '../types/audit.types.js';

class AuditRepository {
  // ----------------------------------------------------------
  // Build the shared WHERE clause from query params
  // ----------------------------------------------------------
  private buildWhere(params: Partial<AuditQueryParams>): Prisma.AuditLogWhereInput {
    const where: Prisma.AuditLogWhereInput = {};

    // Action filter – map frontend action labels to DB enum values
    if (params.action && params.action !== 'ALL') {
      const actionMap: Record<string, string> = {
        CREATED:        'CREATE',
        UPDATED:        'UPDATE',
        DELETED:        'DELETE',
        APPROVED:       'APPROVE',
        REJECTED:       'REJECT',
        REVOKED:        'STATUS_CHANGE',
        ISSUED:         'GENERATE',
        SUSPENDED:      'STATUS_CHANGE',
        ACTIVATED:      'STATUS_CHANGE',
        DEACTIVATED:    'STATUS_CHANGE',
        LOGIN:          'LOGIN',
        LOGOUT:         'LOGOUT',
        FAILED_LOGIN:   'FAILED_LOGIN',
        PASSWORD_RESET: 'PASSWORD_RESET',
        PUBLISHED:      'UPDATE',
        UPLOADED:       'UPLOAD',
        ARCHIVED:       'EXPORT',
      };
      const dbAction = actionMap[params.action] ?? params.action;
      where.action = dbAction as any;
    }

    // Entity type filter
    if (params.entityType && params.entityType !== 'ALL') {
      where.entityType = params.entityType;
    }

    // Date range filter
    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) {
        (where.createdAt as Prisma.DateTimeFilter).gte = new Date(params.dateFrom);
      }
      if (params.dateTo) {
        // Include the full day by setting to end of day
        const to = new Date(params.dateTo);
        to.setHours(23, 59, 59, 999);
        (where.createdAt as Prisma.DateTimeFilter).lte = to;
      }
    }

    // Search – across description, entityType, actorName, ipAddress
    if (params.search?.trim()) {
      const term = params.search.trim();
      where.OR = [
        { description: { contains: term, mode: 'insensitive' } },
        { entityType:  { contains: term, mode: 'insensitive' } },
        { entityId:    { contains: term, mode: 'insensitive' } },
        { actorName:   { contains: term, mode: 'insensitive' } },
        { ipAddress:   { contains: term, mode: 'insensitive' } },
        { module:      { contains: term, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  // ----------------------------------------------------------
  // Build ORDER BY from sort param
  // ----------------------------------------------------------
  private buildOrderBy(sort?: string): Prisma.AuditLogOrderByWithRelationInput {
    switch (sort) {
      case 'oldest':  return { createdAt: 'asc' };
      case 'entity':  return { entityType: 'asc' };
      case 'action':  return { action: 'asc' };
      case 'newest':
      default:        return { createdAt: 'desc' };
    }
  }

  // ----------------------------------------------------------
  // Paginated list – fresh query every call
  // ----------------------------------------------------------
  public async findMany(
    params: AuditQueryParams,
  ): Promise<{ logs: RawAuditLog[]; total: number }> {
    const where   = this.buildWhere(params);
    const orderBy = this.buildOrderBy(params.sort);
    const skip    = (params.page - 1) * params.limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy,
        skip,
        take: params.limit,
        select: {
          id:          true,
          createdAt:   true,
          action:      true,
          entityType:  true,
          entityId:    true,
          description: true,
          actorName:   true,
          actorId:     true,
          ipAddress:   true,
          userAgent:   true,
          oldValues:   true,
          newValues:   true,
          status:      true,
          module:      true,
          severity:    true,
          metadata:    true,
          // legacy fields
          oldData:     true,
          newData:     true,
          timestamp:   true,
          adminId:     true,
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs: logs as RawAuditLog[], total };
  }

  // ----------------------------------------------------------
  // Single record by ID – fresh query every call
  // ----------------------------------------------------------
  public async findById(id: string): Promise<RawAuditLog | null> {
    const log = await prisma.auditLog.findUnique({
      where: { id },
      select: {
        id:          true,
        createdAt:   true,
        action:      true,
        entityType:  true,
        entityId:    true,
        description: true,
        actorName:   true,
        actorId:     true,
        ipAddress:   true,
        userAgent:   true,
        oldValues:   true,
        newValues:   true,
        status:      true,
        module:      true,
        severity:    true,
        metadata:    true,
        oldData:     true,
        newData:     true,
        timestamp:   true,
        adminId:     true,
      },
    });
    return log as RawAuditLog | null;
  }

  // ----------------------------------------------------------
  // Statistics – aggregate counts from live DB data
  // ----------------------------------------------------------
  public async getStatistics(): Promise<{
    totalActions: number;
    creates: number;
    updates: number;
    deletes: number;
    statusChanges: number;
  }> {
    const [
      totalActions,
      creates,
      updates,
      deletes,
      statusChanges,
    ] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({ where: { action: 'CREATE' } }),
      prisma.auditLog.count({ where: { action: 'UPDATE' } }),
      prisma.auditLog.count({ where: { action: 'DELETE' } }),
      prisma.auditLog.count({ where: { action: 'STATUS_CHANGE' } }),
    ]);

    return { totalActions, creates, updates, deletes, statusChanges };
  }

  // ----------------------------------------------------------
  // All logs for export (no pagination, respects filters)
  // ----------------------------------------------------------
  public async findAllForExport(params: Partial<AuditQueryParams>): Promise<RawAuditLog[]> {
    const where   = this.buildWhere(params);
    const orderBy = this.buildOrderBy(params.sort);

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy,
      select: {
        id:          true,
        createdAt:   true,
        action:      true,
        entityType:  true,
        entityId:    true,
        description: true,
        actorName:   true,
        actorId:     true,
        ipAddress:   true,
        userAgent:   true,
        oldValues:   true,
        newValues:   true,
        status:      true,
        module:      true,
        severity:    true,
        metadata:    true,
        oldData:     true,
        newData:     true,
        timestamp:   true,
        adminId:     true,
      },
    });

    return logs as RawAuditLog[];
  }
}

export default new AuditRepository();
