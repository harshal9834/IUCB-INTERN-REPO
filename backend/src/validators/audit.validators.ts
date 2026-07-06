import { z } from 'zod';
import { AuditAction, AuditSeverity } from '@prisma/client';

// Enum validation schemas
const AuditActionSchema = z.nativeEnum(AuditAction);
const AuditSeveritySchema = z.nativeEnum(AuditSeverity);

// Get audit logs validation
export const getAuditLogsSchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  actorId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  action: AuditActionSchema.optional(),
  module: z.string().optional(),
  severity: AuditSeveritySchema.optional(),
  status: z.string().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  ipAddress: z.string().optional(),
  sessionId: z.string().optional(),
  search: z.string().min(1).optional(),
});

// Get entity history validation
export const getEntityHistorySchema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
});

// Get audit stats validation
export const getAuditStatsSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// Get dashboard data validation
export const getDashboardDataSchema = z.object({
  period: z.enum(['24h', '7d', '30d', '90d']).default('7d').optional(),
});

// Get most active admins validation
export const getMostActiveAdminsSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// Get activity timeline validation
export const getActivityTimelineSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
});

// Search audit logs validation
export const searchAuditLogsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  limit: z.coerce.number().min(1).max(50).default(20).optional(),
});

// Alert acknowledgment validation
export const acknowledgeAlertSchema = z.object({
  id: z.string().uuid('Invalid alert ID format'),
});

// Alert resolution validation
export const resolveAlertSchema = z.object({
  id: z.string().uuid('Invalid alert ID format'),
});

// Analytics validation
export const getAnalyticsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d').optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).default('day').optional(),
});

// Export audit logs validation
export const exportAuditLogsSchema = z.object({
  format: z.enum(['csv', 'excel', 'pdf']).default('csv').optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  entityType: z.string().optional(),
  action: AuditActionSchema.optional(),
  severity: AuditSeveritySchema.optional(),
  actorId: z.string().uuid().optional(),
});

// Create audit log validation (for manual logging)
export const createAuditLogSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().min(1, 'Entity ID is required'),
  action: AuditActionSchema,
  module: z.string().min(1, 'Module is required'),
  description: z.string().min(1, 'Description is required'),
  oldValues: z.any().optional(),
  newValues: z.any().optional(),
  metadata: z.any().optional(),
  severity: AuditSeveritySchema.optional(),
});

// Bulk audit log validation
export const bulkAuditLogSchema = z.object({
  logs: z.array(createAuditLogSchema).min(1, 'At least one audit log is required').max(100, 'Maximum 100 logs per batch'),
});

// Date range validation helper
export const dateRangeSchema = z.object({
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
}).refine(
  (data) => data.dateFrom <= data.dateTo,
  {
    message: "Start date must be before or equal to end date",
    path: ["dateFrom"],
  }
);

// Audit log filters validation (comprehensive)
export const auditLogFiltersSchema = z.object({
  // Pagination
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
  
  // Actor filters
  actorId: z.string().uuid().optional(),
  actorName: z.string().optional(),
  actorRole: z.enum(['ADMIN', 'SUPER_ADMIN']).optional(),
  
  // Entity filters
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  
  // Action filters
  action: AuditActionSchema.optional(),
  module: z.string().optional(),
  
  // Metadata filters
  severity: AuditSeveritySchema.optional(),
  status: z.string().optional(),
  riskScore: z.coerce.number().min(0).max(10).optional(),
  
  // Context filters
  ipAddress: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  
  // Time filters
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  
  // Search
  search: z.string().min(1).optional(),
  
  // Sorting
  sortBy: z.enum(['createdAt', 'severity', 'riskScore', 'action']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

// Compliance report validation
export const generateComplianceReportSchema = z.object({
  reportType: z.enum(['SOC2', 'ISO27001', 'GDPR', 'ADMIN_ACTIVITY', 'SECURITY_EVENTS']),
  title: z.string().min(1, 'Report title is required'),
  description: z.string().optional(),
  dateFrom: z.coerce.date(),
  dateTo: z.coerce.date(),
  format: z.enum(['pdf', 'excel', 'csv']).default('pdf'),
  parameters: z.record(z.string(), z.any()).optional(),
}).refine(
  (data) => data.dateFrom <= data.dateTo,
  {
    message: "Start date must be before or equal to end date",
    path: ["dateFrom"],
  }
);

// Alert creation validation
export const createAlertSchema = z.object({
  alertType: z.enum(['MULTIPLE_FAILED_LOGINS', 'UNUSUAL_LOCATION', 'PRIVILEGE_ESCALATION', 'MASS_DELETE', 'MASS_UPDATE', 'BRUTE_FORCE', 'SECURITY_BREACH', 'INTEGRITY_VIOLATION', 'SYSTEM_ERROR']),
  severity: AuditSeveritySchema,
  title: z.string().min(1, 'Alert title is required'),
  description: z.string().min(1, 'Alert description is required'),
  metadata: z.record(z.string(), z.any()).optional(),
  assignedTo: z.string().uuid().optional(),
});

// System configuration validation
export const auditConfigSchema = z.object({
  retentionDays: z.number().min(30).max(3650), // 30 days to 10 years
  archiveAfterDays: z.number().min(90).max(1095), // 3 months to 3 years
  enableRealTimeAlerts: z.boolean().default(true),
  enableIntegrityCheck: z.boolean().default(true),
  maxRiskScore: z.number().min(1).max(10).default(10),
  alertThresholds: z.object({
    failedLoginsCount: z.number().min(3).max(20).default(5),
    failedLoginsTimeWindow: z.number().min(5).max(60).default(15), // minutes
    massOperationThreshold: z.number().min(5).max(100).default(10),
  }),
});

export type GetAuditLogsRequest = z.infer<typeof getAuditLogsSchema>;
export type GetEntityHistoryRequest = z.infer<typeof getEntityHistorySchema>;
export type GetAuditStatsRequest = z.infer<typeof getAuditStatsSchema>;
export type GetDashboardDataRequest = z.infer<typeof getDashboardDataSchema>;
export type GetMostActiveAdminsRequest = z.infer<typeof getMostActiveAdminsSchema>;
export type GetActivityTimelineRequest = z.infer<typeof getActivityTimelineSchema>;
export type SearchAuditLogsRequest = z.infer<typeof searchAuditLogsSchema>;
export type AcknowledgeAlertRequest = z.infer<typeof acknowledgeAlertSchema>;
export type ResolveAlertRequest = z.infer<typeof resolveAlertSchema>;
export type GetAnalyticsRequest = z.infer<typeof getAnalyticsSchema>;
export type ExportAuditLogsRequest = z.infer<typeof exportAuditLogsSchema>;
export type CreateAuditLogRequest = z.infer<typeof createAuditLogSchema>;
export type BulkAuditLogRequest = z.infer<typeof bulkAuditLogSchema>;
export type AuditLogFiltersRequest = z.infer<typeof auditLogFiltersSchema>;
export type GenerateComplianceReportRequest = z.infer<typeof generateComplianceReportSchema>;
export type CreateAlertRequest = z.infer<typeof createAlertSchema>;
export type AuditConfigRequest = z.infer<typeof auditConfigSchema>;