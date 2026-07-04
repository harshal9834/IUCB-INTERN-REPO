// ============================================================
// Audit Helpers – pure utility functions, no DB access
// ============================================================

import type { AuditLogDTO, AuditQueryParams, RawAdmin } from '../types/audit.types.js';

// ---- Dummy data generators ----------------------------------

const DUMMY_IPS = [
  '192.168.1.1',
  '192.168.1.2',
  '192.168.1.10',
  '10.0.0.5',
  '10.0.1.3',
  '172.16.0.8',
];

const DUMMY_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

const DUMMY_REMARKS = [
  'No remarks',
  'Processed as per standard procedure',
  'Reviewed and verified by admin',
  'Action taken as per compliance requirements',
  null,
  null,
];

const REJECTION_REMARKS = [
  'Insufficient qualifications',
  'Incomplete application',
  'Does not meet criteria',
  'Under review – more information required',
];

/** Deterministic-ish selection based on an index so it looks varied but isn't truly random per request */
let _seq = 0;
function pick<T>(arr: T[], seed?: number): T {
  const idx = seed !== undefined ? Math.abs(seed) % arr.length : (_seq++ % arr.length);
  return arr[idx];
}

export function generateDummyIp(seed?: number): string {
  return pick(DUMMY_IPS, seed);
}

export function generateDummyUserAgent(seed?: number): string {
  return pick(DUMMY_USER_AGENTS, seed);
}

export function generateRemarks(type: 'rejected' | 'general' = 'general'): string | null {
  if (type === 'rejected') return pick(REJECTION_REMARKS);
  return pick(DUMMY_REMARKS) as string | null;
}

/** Pick a default admin from the admin list (first super admin, else first admin) */
export function pickAdmin(admins: RawAdmin[]): { adminName: string; adminId: string } {
  if (!admins.length) return { adminName: 'Admin User', adminId: 'system' };
  const superAdmin = admins.find((a) => a.role === 'SUPER_ADMIN');
  const chosen = superAdmin ?? admins[0];
  return { adminName: chosen.fullName, adminId: chosen.id };
}

// ---- Generate random demo values for dashboard --------------

/** Returns a random integer in [min, max] */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export interface DashboardExtras {
  updates: number;
  deletes: number;
  statusChanges: number;
}

/**
 * Given the true `creates` and `total` counts, generates realistic
 * random demo values for updates / deletes / statusChanges.
 */
export function generateDashboardExtras(total: number, creates: number): DashboardExtras {
  const remaining = Math.max(0, total - creates);
  const deletes = randInt(Math.floor(remaining * 0.05), Math.floor(remaining * 0.15));
  const statusChanges = randInt(Math.floor(remaining * 0.10), Math.floor(remaining * 0.25));
  const updates = Math.max(0, remaining - deletes - statusChanges);
  return { updates, deletes, statusChanges };
}

// ---- Chart data generator -----------------------------------

export interface ChartDataPoint {
  period: string;
  count: number;
}

/** Generates the last N months as chart buckets from an audit list */
export function buildChartData(logs: AuditLogDTO[], months = 6): ChartDataPoint[] {
  const now = new Date();
  const buckets: Record<string, number> = {};

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    buckets[key] = 0;
  }

  logs.forEach((log) => {
    const d = new Date(log.timestamp);
    const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    if (key in buckets) buckets[key] += 1;
  });

  return Object.entries(buckets).map(([period, count]) => ({ period, count }));
}

// ---- Sorting ------------------------------------------------

export function sortLogs(logs: AuditLogDTO[], sort: AuditQueryParams['sort'] = 'newest'): AuditLogDTO[] {
  const arr = [...logs];
  switch (sort) {
    case 'oldest':
      return arr.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    case 'entity':
      return arr.sort((a, b) => a.entityName.localeCompare(b.entityName));
    case 'action':
      return arr.sort((a, b) => a.action.localeCompare(b.action));
    case 'newest':
    default:
      return arr.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

// ---- Search -------------------------------------------------

export function searchLogs(logs: AuditLogDTO[], query: string): AuditLogDTO[] {
  if (!query || query.trim() === '') return logs;
  const q = query.toLowerCase().trim();
  return logs.filter(
    (log) =>
      log.entityName.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q) ||
      log.adminName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.id.toLowerCase().includes(q),
  );
}

// ---- Filtering ----------------------------------------------

export function filterLogs(logs: AuditLogDTO[], params: AuditQueryParams): AuditLogDTO[] {
  let result = logs;

  // Action filter
  if (params.action && params.action !== 'ALL') {
    result = result.filter((l) => l.action === params.action);
  }

  // Entity type filter
  if (params.entityType && params.entityType !== 'ALL') {
    result = result.filter((l) => l.entityType === params.entityType);
  }

  // Date range filter
  if (params.dateFrom) {
    const from = new Date(params.dateFrom);
    from.setHours(0, 0, 0, 0);
    result = result.filter((l) => new Date(l.timestamp) >= from);
  }
  if (params.dateTo) {
    const to = new Date(params.dateTo);
    to.setHours(23, 59, 59, 999);
    result = result.filter((l) => new Date(l.timestamp) <= to);
  }

  // Module filter (maps to entityType loosely)
  if (params.module && params.module !== 'ALL') {
    result = result.filter((l) =>
      l.entityType.toLowerCase() === params.module!.toLowerCase(),
    );
  }

  return result;
}

// ---- Pagination ---------------------------------------------

export function paginateLogs(
  logs: AuditLogDTO[],
  page: number,
  limit: number,
): { items: AuditLogDTO[]; total: number; totalPages: number } {
  const total = logs.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  return {
    items: logs.slice(start, start + limit),
    total,
    totalPages,
  };
}
