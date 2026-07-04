// ============================================================
// Audit Service – merge, normalize, sort, paginate, filter,
// search, and compute dashboard statistics.
// No direct DB access here – all through the repository.
// ============================================================

import auditRepository from '../repositories/audit.repository.js';
import {
  mapOrganization,
  mapAuditor,
  mapCredential,
  mapApplication,
  mapAdvisor,
  mapNews,
  mapResource,
} from '../utils/audit.mapper.js';
import {
  pickAdmin,
  sortLogs,
  searchLogs,
  filterLogs,
  paginateLogs,
  generateDashboardExtras,
  buildChartData,
} from '../utils/audit.helpers.js';
import type {
  AuditLogDTO,
  AuditQueryParams,
  AuditLogsResponseDTO,
  AuditStatisticsDTO,
} from '../types/audit.types.js';

class AuditService {
  // ----------------------------------------------------------
  // Build the merged & sorted master log list
  // ----------------------------------------------------------
  private async buildAllLogs(): Promise<{ logs: AuditLogDTO[]; adminName: string; adminId: string }> {
    const raw = await auditRepository.fetchAllRawData();
    const { adminName, adminId } = pickAdmin(raw.admins);

    const logs: AuditLogDTO[] = [
      ...raw.organizations.map((r) => mapOrganization(r, adminName, adminId)),
      ...raw.auditors.map((r) => mapAuditor(r, adminName, adminId)),
      ...raw.credentials.map((r) => mapCredential(r, adminName, adminId)),
      ...raw.applications.map((r) => mapApplication(r, adminName, adminId)),
      ...raw.advisors.map((r) => mapAdvisor(r, adminName, adminId)),
      ...raw.news.map((r) => mapNews(r, adminName, adminId)),
      ...raw.resources.map((r) => mapResource(r, adminName, adminId)),
    ];

    // Default sort: newest first
    return { logs: sortLogs(logs, 'newest'), adminName, adminId };
  }

  // ----------------------------------------------------------
  // GET /audit-logs
  // ----------------------------------------------------------
  public async getLogs(params: AuditQueryParams): Promise<AuditLogsResponseDTO> {
    const { logs } = await this.buildAllLogs();

    // Apply filters → search → sort → paginate
    const filtered = filterLogs(logs, params);
    const searched = searchLogs(filtered, params.search ?? '');
    const sorted   = sortLogs(searched, params.sort ?? 'newest');
    const { items, total, totalPages } = paginateLogs(sorted, params.page, params.limit);

    return {
      logs: items,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  // ----------------------------------------------------------
  // GET /audit-logs/:id
  // ----------------------------------------------------------
  public async getLogById(id: string): Promise<AuditLogDTO | null> {
    const { logs } = await this.buildAllLogs();
    return logs.find((l) => l.id === id) ?? null;
  }

  // ----------------------------------------------------------
  // GET /audit-logs/statistics
  // ----------------------------------------------------------
  public async getStatistics(): Promise<AuditStatisticsDTO> {
    const { logs } = await this.buildAllLogs();
    const total = logs.length;

    // Creates are real counts
    const creates = logs.filter((l) =>
      ['CREATED', 'ISSUED', 'UPLOADED', 'PUBLISHED'].includes(l.action),
    ).length;

    // Updates, deletes, statusChanges: realistic demo values
    const { updates, deletes, statusChanges } = generateDashboardExtras(total, creates);

    return {
      totalActions: total,
      creates,
      updates,
      deletes,
      statusChanges,
    };
  }

  // ----------------------------------------------------------
  // Export: return all (filtered) logs for CSV / PDF
  // ----------------------------------------------------------
  public async getLogsForExport(params: Partial<AuditQueryParams>): Promise<AuditLogDTO[]> {
    const { logs } = await this.buildAllLogs();

    const query: AuditQueryParams = {
      page: 1,
      limit: Number.MAX_SAFE_INTEGER,
      ...params,
    };

    const filtered = filterLogs(logs, query);
    const searched = searchLogs(filtered, query.search ?? '');
    return sortLogs(searched, query.sort ?? 'newest');
  }

  // ----------------------------------------------------------
  // Chart data (used by dashboard)
  // ----------------------------------------------------------
  public async getChartData() {
    const { logs } = await this.buildAllLogs();
    return buildChartData(logs, 6);
  }
}

export default new AuditService();
