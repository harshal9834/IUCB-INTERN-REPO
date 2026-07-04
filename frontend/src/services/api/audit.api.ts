import { axiosInstance } from './axios.js'
import type { AuditFilters } from '../../types/audit'

// Query params accepted by GET /audit-logs
export interface AuditLogsParams extends Partial<AuditFilters> {
  page?: number
  limit?: number
  sort?: 'newest' | 'oldest' | 'entity' | 'action'
}

export const auditApi = {
  /** GET /api/v1/audit-logs – paginated, filtered, sorted */
  getAuditLogs: (params?: AuditLogsParams) =>
    axiosInstance.get('/audit-logs', { params }),

  /** GET /api/v1/audit-logs/:id – full detail for the drawer */
  getAuditLogById: (id: string) =>
    axiosInstance.get(`/audit-logs/${id}`),

  /** GET /api/v1/audit-logs/statistics – dashboard cards */
  getAuditStatistics: (params?: Pick<AuditFilters, 'dateFrom' | 'dateTo'>) =>
    axiosInstance.get('/audit-logs/statistics', { params }),

  /** GET /api/v1/audit-logs/export?format=csv */
  exportAuditCSV: (params?: Partial<AuditFilters>) =>
    axiosInstance.get('/audit-logs/export', {
      params: { ...params, format: 'csv' },
      responseType: 'blob',
    }),

  /** GET /api/v1/audit-logs/export?format=pdf */
  exportAuditPDF: (params?: Partial<AuditFilters>) =>
    axiosInstance.get('/audit-logs/export', {
      params: { ...params, format: 'pdf' },
      responseType: 'blob',
    }),
}

export default auditApi
