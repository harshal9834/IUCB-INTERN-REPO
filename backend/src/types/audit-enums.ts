// ============================================================
// Local enum definitions for audit/alert types.
// These mirror the enums that would exist in the Prisma schema
// once the AuditLog extended tables are added.
// Used by the feature-branch middlewares and services until
// the schema is updated.
// ============================================================

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  GENERATE = 'GENERATE',
  DOWNLOAD = 'DOWNLOAD',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  UPLOAD = 'UPLOAD',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ROLE_CHANGE = 'ROLE_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  BULK_DELETE = 'BULK_DELETE',
  BULK_UPDATE = 'BULK_UPDATE',
}

export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertType {
  MULTIPLE_FAILED_LOGINS = 'MULTIPLE_FAILED_LOGINS',
  MASS_DELETE = 'MASS_DELETE',
  MASS_UPDATE = 'MASS_UPDATE',
  PRIVILEGE_ESCALATION = 'PRIVILEGE_ESCALATION',
  UNUSUAL_ACTIVITY = 'UNUSUAL_ACTIVITY',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
}
