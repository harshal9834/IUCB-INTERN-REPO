// ============================================================
// Audit Module – Types & Interfaces
// When a real AuditLog table is added later, only the
// repository layer changes. Service / Controller / Frontend
// remain untouched.
// ============================================================

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
  | 'UPLOADED'
  | 'ARCHIVED';

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
  | 'Certificate';

export type AuditStatus = 'SUCCESS' | 'FAILED';

/** Canonical audit log entry – matches frontend AuditLog interface exactly */
export interface AuditLogDTO {
  id: string;
  timestamp: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityName: string;
  entityId: string;
  details: string;
  adminName: string;
  adminId: string;
  ipAddress: string;
  userAgent: string;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  remarks: string | null;
  status: AuditStatus;
}

/** Dashboard statistics – matches frontend AuditStatistics interface */
export interface AuditStatisticsDTO {
  totalActions: number;
  creates: number;
  updates: number;
  deletes: number;
  statusChanges: number;
}

/** Pagination envelope – matches frontend AuditPagination interface */
export interface AuditPaginationDTO {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Paginated list response – matches frontend AuditResponse interface */
export interface AuditLogsResponseDTO {
  logs: AuditLogDTO[];
  pagination: AuditPaginationDTO;
}

/** Query params for GET /audit-logs */
export interface AuditQueryParams {
  page: number;
  limit: number;
  search?: string;
  action?: AuditAction | 'ALL';
  entityType?: AuditEntityType | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  module?: string;
  sort?: 'newest' | 'oldest' | 'entity' | 'action';
}

// ---- Raw database shapes (repository layer output) -----------

export interface RawOrganization {
  id: string;
  organizationName: string;
  accreditationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawAuditor {
  id: string;
  fullName: string;
  email: string;
  tier: string;
  status: string;
  createdAt: Date;
}

export interface RawCredential {
  id: string;
  credentialId: string;
  standard: string;
  status: string;
  createdAt: Date;
}

export interface RawAdvisoryApplication {
  id: string;
  fullName: string;
  applicationStatus: string;
  createdAt: Date;
}

export interface RawAdvisor {
  id: string;
  fullName: string;
  status: string;
  createdAt: Date;
}

export interface RawNews {
  id: string;
  title: string;
  isPublished: boolean;
  createdAt: Date;
}

export interface RawResource {
  id: string;
  title: string;
  category: string;
  createdAt: Date;
}

export interface RawAdmin {
  id: string;
  fullName: string;
  role: string;
}

/** Aggregated raw data fetched by the repository in one pass */
export interface RawAuditData {
  organizations: RawOrganization[];
  auditors: RawAuditor[];
  credentials: RawCredential[];
  applications: RawAdvisoryApplication[];
  advisors: RawAdvisor[];
  news: RawNews[];
  resources: RawResource[];
  admins: RawAdmin[];
}
