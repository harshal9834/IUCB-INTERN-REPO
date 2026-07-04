// ============================================================
// Audit Validator – parses & coerces query params
// ============================================================

import { z } from 'zod';

const AUDIT_ACTIONS = [
  'ALL',
  'CREATED', 'UPDATED', 'DELETED', 'APPROVED', 'REJECTED',
  'REVOKED', 'ISSUED', 'SUSPENDED', 'ACTIVATED', 'DEACTIVATED',
  'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_RESET',
  'PUBLISHED', 'UPLOADED', 'ARCHIVED',
] as const;

const AUDIT_ENTITY_TYPES = [
  'ALL',
  'Organization', 'Auditor', 'Credential', 'Application',
  'Advisory', 'Content', 'Settings', 'Authentication',
  'Email', 'Certificate',
] as const;

const SORT_OPTIONS = ['newest', 'oldest', 'entity', 'action'] as const;

export const auditQuerySchema = z.object({
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(500).default(10),
  search:     z.string().trim().optional(),
  action:     z.enum(AUDIT_ACTIONS).optional(),
  entityType: z.enum(AUDIT_ENTITY_TYPES).optional(),
  dateFrom:   z.string().optional(),
  dateTo:     z.string().optional(),
  module:     z.string().optional(),
  sort:       z.enum(SORT_OPTIONS).default('newest'),
  format:     z.enum(['csv', 'pdf']).optional(),
});

export type AuditQuery = z.infer<typeof auditQuerySchema>;
