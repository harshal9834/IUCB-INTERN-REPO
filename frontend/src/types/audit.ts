export type AuditAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVOKED'
  | 'ISSUED'
  | 'SUSPENDED'
  | 'ACTIVATED'
  | 'DEACTIVATED'
  | 'LOGIN'
  | 'LOGOUT'
  | 'FAILED_LOGIN'
  | 'PASSWORD_RESET'
  | 'PUBLISHED'
  | 'ARCHIVED'

export type AuditEntityType =
  | 'Organization'
  | 'Auditor'
  | 'Credential'
  | 'Application'
  | 'Advisory'
  | 'Content'
  | 'Settings'
  | 'Authentication'
  | 'Email'
  | 'Certificate'

export interface AuditLog {
  id: string
  timestamp: string
  action: AuditAction
  entityType: AuditEntityType
  entityName: string
  entityId: string
  details: string
  adminName: string
  adminId: string
  ipAddress: string
  userAgent: string
  oldData?: Record<string, unknown> | null
  newData?: Record<string, unknown> | null
  remarks?: string | null
  status: 'SUCCESS' | 'FAILED'
}

export interface AuditStatistics {
  totalActions: number
  creates: number
  updates: number
  deletes: number
  statusChanges: number
}

export interface AuditFilters {
  dateFrom?: string
  dateTo?: string
  action?: AuditAction | 'ALL'
  entityType?: AuditEntityType | 'ALL'
  search?: string
}

export interface AuditPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AuditResponse {
  logs: AuditLog[]
  pagination: AuditPagination
}

export interface AuditDetails extends AuditLog {}
