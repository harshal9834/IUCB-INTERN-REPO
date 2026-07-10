import { z } from 'zod';

// Base schema for bulk operations
const bulkBaseSchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID format'))
    .min(1, 'At least one ID is required')
    .max(100, 'Maximum 100 items per batch'),
});

// Bulk update schema
export const bulkUpdateSchema = bulkBaseSchema.extend({
  data: z.object({}).passthrough()
    .refine(data => Object.keys(data).length > 0, {
      message: 'Update data cannot be empty'
    }),
});

// Bulk status update schema
export const bulkStatusUpdateSchema = z.object({
  updates: z.array(z.object({
    id: z.string().uuid('Invalid UUID format'),
    status: z.string().min(1, 'Status is required'),
  }))
  .min(1, 'At least one update is required')
  .max(100, 'Maximum 100 items per batch'),
});

// Bulk approve/reject schema
export const bulkApproveRejectSchema = bulkBaseSchema.extend({
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// Bulk delete schema
export const bulkDeleteSchema = bulkBaseSchema.extend({
  permanent: z.boolean().default(false),
  reason: z.string().optional(),
});

// Organization-specific bulk update
export const bulkUpdateOrganizationsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  data: z.object({
    organizationName: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
    website: z.string().url().nullable().optional(),
    accreditationDate: z.coerce.date().optional(),
    expiryDate: z.coerce.date().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  }),
});

// Organization status update
export const bulkUpdateOrganizationStatusSchema = z.object({
  updates: z.array(z.object({
    id: z.string().uuid(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'REVOKED']),
  })).min(1).max(100),
});

// Application bulk operations
export const bulkApproveApplicationsSchema = bulkApproveRejectSchema.extend({
  autoCreateEntities: z.boolean().default(true),
  sendNotificationEmails: z.boolean().default(true),
});

export const bulkRejectApplicationsSchema = bulkApproveRejectSchema.extend({
  reason: z.string().min(1, 'Rejection reason is required'),
  sendNotificationEmails: z.boolean().default(true),
});

// Credential bulk operations
export const bulkUpdateCredentialStatusSchema = z.object({
  updates: z.array(z.object({
    id: z.string().uuid(),
    status: z.enum(['VALID', 'SUSPENDED', 'REVOKED', 'EXPIRED']),
    reason: z.string().optional(),
  })).min(1).max(100),
});

export const bulkDeleteCredentialsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50), // Lower limit for safety
  permanent: z.boolean().default(false),
  reason: z.string().min(1, 'Deletion reason is required'),
  confirmDelete: z.boolean().refine(val => val === true, {
    message: 'Delete confirmation is required'
  }),
});

// Email bulk operations
export const bulkSendEmailsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  template: z.string().min(1, 'Email template is required'),
  subject: z.string().min(1, 'Email subject is required').optional(),
  customMessage: z.string().optional(),
  scheduledFor: z.coerce.date().optional(),
});

// Advisor bulk operations
export const bulkUpdateAdvisorStatusSchema = z.object({
  updates: z.array(z.object({
    id: z.string().uuid(),
    status: z.enum(['ACTIVE', 'INACTIVE']),
    reason: z.string().optional(),
  })).min(1).max(100),
});

// Auditor bulk operations
export const bulkUpdateAuditorsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  data: z.object({
    tier: z.enum(['ASSOCIATE', 'SENIOR', 'LEAD']).optional(),
    specialization: z.string().min(1).optional(),
    experienceYears: z.number().int().min(0).optional(),
    status: z.string().optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
  }),
});

// Training Institute bulk operations
export const bulkUpdateTrainingInstituteStatusSchema = z.object({
  updates: z.array(z.object({
    id: z.string().uuid(),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'REVOKED']),
    reason: z.string().optional(),
  })).min(1).max(100),
});

// Bulk operation history query
export const bulkOperationHistorySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  entityType: z.string().optional(),
  action: z.enum([
    'BULK_UPDATE', 
    'BULK_DELETE', 
    'BULK_APPROVE', 
    'BULK_REJECT',
    'BULK_STATUS_CHANGE'
  ]).optional(),
  adminId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

// Bulk import schema
export const bulkImportSchema = z.object({
  entityType: z.enum([
    'ORGANIZATION', 
    'AUDITOR', 
    'TRAINING_INSTITUTE', 
    'APPLICATION'
  ]),
  data: z.array(z.object({}).passthrough()).min(1).max(1000),
  validateOnly: z.boolean().default(false),
  skipErrors: z.boolean().default(false),
  sendNotifications: z.boolean().default(false),
});

// Bulk export schema
export const bulkExportSchema = z.object({
  entityType: z.enum([
    'ORGANIZATION', 
    'AUDITOR', 
    'CREDENTIAL', 
    'APPLICATION', 
    'ADVISOR', 
    'TRAINING_INSTITUTE',
    'AUDIT_LOG'
  ]),
  format: z.enum(['CSV', 'EXCEL', 'PDF']).default('CSV'),
  filters: z.object({
    ids: z.array(z.string().uuid()).optional(),
    status: z.string().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
  }).optional(),
  includeDeleted: z.boolean().default(false),
  includeAuditTrail: z.boolean().default(false),
});

// Validation for concurrent bulk operations (rate limiting)
export const bulkOperationRateLimit = z.object({
  operationType: z.string(),
  adminId: z.string().uuid(),
  timestamp: z.date(),
});

// Type exports
export type BulkUpdateRequest = z.infer<typeof bulkUpdateSchema>;
export type BulkStatusUpdateRequest = z.infer<typeof bulkStatusUpdateSchema>;
export type BulkApproveRejectRequest = z.infer<typeof bulkApproveRejectSchema>;
export type BulkDeleteRequest = z.infer<typeof bulkDeleteSchema>;
export type BulkUpdateOrganizationsRequest = z.infer<typeof bulkUpdateOrganizationsSchema>;
export type BulkUpdateOrganizationStatusRequest = z.infer<typeof bulkUpdateOrganizationStatusSchema>;
export type BulkApproveApplicationsRequest = z.infer<typeof bulkApproveApplicationsSchema>;
export type BulkRejectApplicationsRequest = z.infer<typeof bulkRejectApplicationsSchema>;
export type BulkUpdateCredentialStatusRequest = z.infer<typeof bulkUpdateCredentialStatusSchema>;
export type BulkDeleteCredentialsRequest = z.infer<typeof bulkDeleteCredentialsSchema>;
export type BulkSendEmailsRequest = z.infer<typeof bulkSendEmailsSchema>;
export type BulkUpdateAdvisorStatusRequest = z.infer<typeof bulkUpdateAdvisorStatusSchema>;
export type BulkUpdateAuditorsRequest = z.infer<typeof bulkUpdateAuditorsSchema>;
export type BulkUpdateTrainingInstituteStatusRequest = z.infer<typeof bulkUpdateTrainingInstituteStatusSchema>;
export type BulkOperationHistoryRequest = z.infer<typeof bulkOperationHistorySchema>;
export type BulkImportRequest = z.infer<typeof bulkImportSchema>;
export type BulkExportRequest = z.infer<typeof bulkExportSchema>;