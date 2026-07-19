// ============================================================
// Audit Service – reads from the AuditLog table via repository.
// Every request triggers a fresh DB query – no in-memory cache.
// ============================================================

import auditRepository from '../repositories/audit.repository.js';
import type {
  AuditLogDTO,
  AuditQueryParams,
  AuditLogsResponseDTO,
  AuditStatisticsDTO,
  RawAuditLog,
} from '../types/audit.types.js';

// Exported for compatibility with middlewares/services
export interface AuditContext {
  adminId?: string;
  adminName?: string;
  adminRole?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
}

export interface EntityChange {
  entityId: string;
  entityType: string;
  oldData?: any;
  newData?: any;
}

// ----------------------------------------------------------
// Map a raw DB AuditLog row → AuditLogDTO (frontend shape)
// ----------------------------------------------------------
function mapRawToDTO(raw: RawAuditLog): AuditLogDTO {
  // Normalise action: DB stores CREATE/UPDATE/DELETE etc.;
  // frontend expects CREATED/UPDATED/DELETED etc.
  const actionMap: Record<string, string> = {
    CREATE:          'CREATED',
    UPDATE:          'UPDATED',
    DELETE:          'DELETED',
    APPROVE:         'APPROVED',
    REJECT:          'REJECTED',
    STATUS_CHANGE:   'UPDATED',
    GENERATE:        'ISSUED',
    UPLOAD:          'UPLOADED',
    EXPORT:          'ARCHIVED',
    LOGIN:           'LOGIN',
    LOGOUT:          'LOGOUT',
    FAILED_LOGIN:    'FAILED_LOGIN',
    PASSWORD_CHANGE: 'UPDATED',
    PASSWORD_RESET:  'PASSWORD_RESET',
    SEND_EMAIL:      'UPDATED',
    DOWNLOAD:        'UPDATED',
    IMPORT:          'CREATED',
    BULK_UPDATE:     'UPDATED',
    BULK_DELETE:     'DELETED',
    ROLE_CHANGE:     'UPDATED',
    PERMISSION_CHANGE: 'UPDATED',
  };

  const rawAction  = (raw.action ?? '').toUpperCase();
  const action     = (actionMap[rawAction] ?? rawAction) as AuditLogDTO['action'];
  const timestamp  = (raw.timestamp ?? raw.createdAt).toISOString();

  // Prefer newValues/oldValues; fall back to legacy newData/oldData
  const newData =
    raw.newValues != null
      ? (raw.newValues as Record<string, unknown>)
      : raw.newData != null
      ? (raw.newData as Record<string, unknown>)
      : null;

  const oldData =
    raw.oldValues != null
      ? (raw.oldValues as Record<string, unknown>)
      : raw.oldData != null
      ? (raw.oldData as Record<string, unknown>)
      : null;

  return {
    id:          raw.id,
    timestamp,
    action,
    entityType:  raw.entityType as AuditLogDTO['entityType'],
    entityName:  (newData as any)?.name
                   ?? (newData as any)?.fullName
                   ?? (newData as any)?.title
                   ?? raw.entityId,
    entityId:    raw.entityId,
    details:     raw.description ?? `${action} on ${raw.entityType}`,
    adminName:   raw.actorName ?? 'System',
    adminId:     raw.actorId ?? raw.adminId ?? '',
    ipAddress:   raw.ipAddress ?? '',
    userAgent:   raw.userAgent ?? '',
    oldData,
    newData,
    remarks:     raw.module ?? null,
    status:      (raw.status?.toUpperCase() === 'SUCCESS' ? 'SUCCESS' : 'FAILED') as AuditLogDTO['status'],
  };
}

class AuditService {
  // ----------------------------------------------------------
  // GET /audit-logs – paginated, filtered, sorted
  // ----------------------------------------------------------
  public async getLogs(params: AuditQueryParams): Promise<AuditLogsResponseDTO> {
    const { logs: rawLogs, total } = await auditRepository.findMany(params);
    const totalPages = Math.max(1, Math.ceil(total / params.limit));

    return {
      logs: rawLogs.map(mapRawToDTO),
      pagination: {
        page:       params.page,
        limit:      params.limit,
        total,
        totalPages,
      },
    };
  }

  // ----------------------------------------------------------
  // GET /audit-logs/:id
  // ----------------------------------------------------------
  public async getLogById(id: string): Promise<AuditLogDTO | null> {
    const raw = await auditRepository.findById(id);
    return raw ? mapRawToDTO(raw) : null;
  }

  // ----------------------------------------------------------
  // GET /audit-logs/statistics – live DB aggregation
  // ----------------------------------------------------------
  public async getStatistics(): Promise<AuditStatisticsDTO> {
    return auditRepository.getStatistics();
  }

  // ----------------------------------------------------------
  // Export – all filtered logs, no pagination
  // ----------------------------------------------------------
  public async getLogsForExport(params: Partial<AuditQueryParams>): Promise<AuditLogDTO[]> {
    const rawLogs = await auditRepository.findAllForExport(params);
    return rawLogs.map(mapRawToDTO);
  }

  // ----------------------------------------------------------
  // Compatibility stubs – actual write path via Prisma direct
  // ----------------------------------------------------------
  public async logAudit(
    _context: AuditContext,
    _entityType: string,
    _entityId: string,
    _action: any,
    _module: string,
    _description: string,
    _oldData?: any,
    _newData?: any,
    _metadata?: any,
    _severity?: any,
  ): Promise<void> {
    // No-op stub — the audit middleware writes directly to Prisma
  }

  public async logBulkAudit(
    _context: AuditContext,
    _entityType: string,
    _changes: EntityChange[],
    _action: any,
    _module: string,
    _description: string,
    _severity?: any,
  ): Promise<void> {
    // No-op stub
  }
}

export default new AuditService();
