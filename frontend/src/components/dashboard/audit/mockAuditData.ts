// Mock data removed – Audit Logs are now fully database-driven.
// All data is fetched live from PostgreSQL via the backend API.
// This file is kept to avoid import errors in any legacy references.

import type { AuditLog, AuditStatistics } from '../../../types/audit'

export const mockAuditLogs: AuditLog[] = []

export const mockAuditStatistics: AuditStatistics = {
  totalActions: 0,
  creates: 0,
  updates: 0,
  deletes: 0,
  statusChanges: 0,
}
