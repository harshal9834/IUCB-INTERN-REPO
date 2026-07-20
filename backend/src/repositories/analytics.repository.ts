import prisma from "../config/Database.js";
import { AnalyticsQuery } from "../validators/analytics.validators.js";

type DateFilter = { gte?: Date; lte?: Date };

type TimeBucket = {
  period: string;
  start: Date;
  key: string;
};

const getDateRange = (query: AnalyticsQuery, field: string): DateFilter | undefined => {
  const now = new Date();
  let startDate: Date | undefined = query.startDate;
  let endDate: Date | undefined = query.endDate;

  if (!startDate || !endDate) {
    switch (query.dateRange) {
      case "TODAY":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = now;
        break;
      case "LAST_7_DAYS":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 6);
        endDate = now;
        break;
      case "LAST_MONTH":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 29);
        endDate = now;
        break;
      case "LAST_90_DAYS":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 89);
        endDate = now;
        break;
      case "LAST_6_MONTHS":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setMonth(startDate.getMonth() - 6);
        endDate = now;
        break;
      case "LAST_YEAR":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = now;
        break;
      case "CUSTOM":
        break;
      default:
        break;
    }
  }

  if (startDate || endDate) {
    const filter: DateFilter = {};
    if (startDate) filter.gte = startDate;
    if (endDate) filter.lte = endDate;
    return filter;
  }

  return undefined;
};

const buildWhere = (query: AnalyticsQuery, dateField: string, includeOrg = false, includeStandard = false) => {
  const where: any = { deletedAt: null };
  const dateFilter = getDateRange(query, dateField);
  if (dateFilter) {
    where[dateField] = dateFilter;
  }

  if (includeOrg && query.organizationId) {
    where.organizationId = query.organizationId;
  }

  if (includeStandard && query.standard) {
    where.standard = query.standard;
  }

  return where;
};

const cleanAuditDetails = (audit: any) => {
  if (audit.description) {
    return audit.description;
  }

  const data = audit.newData ?? audit.oldData ?? {};
  if (!data) return "N/A";

  if (typeof data === "string") {
    if (data.startsWith("{") && data.endsWith("}")) {
      try {
        const parsed = JSON.parse(data);
        return cleanAuditDetails({ ...audit, newData: parsed });
      } catch {
        return data.trim();
      }
    }
    return data.trim();
  }

  if (typeof data === "object") {
    const parts: string[] = [];

    if (data.reason) {
      parts.push(`Reason: ${String(data.reason).trim()}`);
    }
    if (data.status) {
      parts.push(`Status: ${data.status}`);
    }
    if (data.subject) {
      parts.push(`Subject: "${data.subject}"`);
    }
    if (data.recipient) {
      parts.push(`Recipient: ${data.recipient}`);
    }
    if (data.applicationStatus) {
      parts.push(`App Status: ${data.applicationStatus}`);
    }
    if (data.fullName) {
      parts.push(`Name: ${data.fullName}`);
    }
    if (data.company || data.organization) {
      parts.push(`Org: ${data.company || data.organization}`);
    }
    if (data.standard) {
      parts.push(`Standard: ${data.standard}`);
    }
    if (data.credentialId) {
      parts.push(`Credential: ${data.credentialId}`);
    }
    if (data.mappedTable) {
      parts.push(`Mapped: ${data.mappedTable}`);
    }
    if (data.insertedId) {
      parts.push(`ID: ${data.insertedId}`);
    }
    if (data.remarks) {
      parts.push(`Remarks: ${data.remarks}`);
    }

    if (parts.length > 0) {
      return parts.join(" • ");
    }

    const keys = Object.keys(data).filter((k) => data[k] !== null && data[k] !== undefined);
    if (keys.length > 0) {
      return keys
        .map((k) => `${k}: ${typeof data[k] === "object" ? JSON.stringify(data[k]) : data[k]}`)
        .join(", ");
    }
  }

  return audit.action ? `${audit.action} on ${audit.entityType}` : "N/A";
};

const formatBucketLabel = (date: Date, groupByMonth: boolean) => {
  if (groupByMonth) {
    return date.toLocaleString("en-US", { month: "short", year: "numeric" });
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const createBuckets = (startDate: Date, endDate: Date, groupByMonth: boolean): TimeBucket[] => {
  const buckets: TimeBucket[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  if (groupByMonth) {
    current.setDate(1);
    while (current <= endDate) {
      const key = `${current.getFullYear()}-${current.getMonth()}`;
      buckets.push({ period: formatBucketLabel(current, true), start: new Date(current), key });
      current.setMonth(current.getMonth() + 1);
    }
    return buckets;
  }

  while (current <= endDate) {
    const key = `${current.getFullYear()}-${current.getMonth()}-${current.getDate()}`;
    buckets.push({ period: formatBucketLabel(current, false), start: new Date(current), key });
    current.setDate(current.getDate() + 1);
  }

  return buckets;
};

const bucketKey = (date: Date, groupByMonth: boolean) => {
  if (groupByMonth) {
    return `${date.getFullYear()}-${date.getMonth()}`;
  }
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

const createTimeSeries = <T extends { createdAt: Date }>(records: T[], startDate: Date, endDate: Date, groupByMonth: boolean) => {
  const buckets = createBuckets(startDate, endDate, groupByMonth);
  const counts = buckets.reduce<Record<string, number>>((acc, bucket) => {
    acc[bucket.key] = 0;
    return acc;
  }, {});

  records.forEach((item) => {
    const key = bucketKey(new Date(item.createdAt), groupByMonth);
    if (counts[key] !== undefined) {
      counts[key] += 1;
    }
  });

  return buckets.map((bucket) => ({ period: bucket.period, count: counts[bucket.key] ?? 0 }));
};

const createApplicationTrend = (records: Array<{ createdAt: Date; applicationStatus: string }>, startDate: Date, endDate: Date, groupByMonth: boolean) => {
  const buckets = createBuckets(startDate, endDate, groupByMonth);
  const counts = buckets.reduce<Record<string, { submitted: number; approved: number }>>((acc, bucket) => {
    acc[bucket.key] = { submitted: 0, approved: 0 };
    return acc;
  }, {});

  records.forEach((record) => {
    const key = bucketKey(new Date(record.createdAt), groupByMonth);
    if (counts[key]) {
      if (record.applicationStatus === "PENDING") {
        counts[key].submitted += 1;
      }
      if (record.applicationStatus === "APPROVED") {
        counts[key].approved += 1;
      }
    }
  });

  return buckets.map((bucket) => ({ period: bucket.period, submitted: counts[bucket.key]?.submitted ?? 0, approved: counts[bucket.key]?.approved ?? 0 }));
};

const resolveRange = (query: AnalyticsQuery) => {
  const now = new Date();
  let startDate = query.startDate;
  let endDate = query.endDate ?? now;

  if (!startDate || !query.endDate) {
    switch (query.dateRange) {
      case "TODAY":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "LAST_7_DAYS":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 6);
        break;
      case "LAST_MONTH":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 29);
        break;
      case "LAST_90_DAYS":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 89);
        break;
      case "LAST_6_MONTHS":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "LAST_YEAR":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "CUSTOM":
        if (!startDate) {
          startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 29);
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 29);
        break;
    }
  }

  if (!startDate) {
    startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 29);
  }

  if (startDate > endDate) {
    endDate = new Date(startDate);
  }

  return { startDate, endDate };
};

class AnalyticsRepository {
  public async getDashboardData(query: AnalyticsQuery) {
    const { startDate, endDate } = resolveRange(query);
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const groupByMonth = dayCount > 90 || query.dateRange === "LAST_YEAR" || query.dateRange === "LAST_6_MONTHS";

    // ── KPI counts are always ALL-TIME totals (no date filter) ──────────────
    // Only time-series charts respect the date range window
    const baseWhere = { deletedAt: null };
    const credentialBaseWhere = { deletedAt: null };

    // Date-filtered WHERE for time-series data only
    const organizationWhere = buildWhere(query, "createdAt");
    const auditorWhere = buildWhere(query, "createdAt", true);
    const credentialWhere = buildWhere(query, "issueDate", true, true);
    const applicationWhere = buildWhere(query, "createdAt");
    const advisorWhere = buildWhere(query, "createdAt");
    const resourceWhere = buildWhere(query, "createdAt");

    const [
      // All-time KPI counts
      totalOrganizations,
      activeOrganizations,
      totalAuditors,
      totalCredentials,
      validCredentials,
      totalApplications,
      approvedApplications,
      totalAdvisors,
      activeAdvisors,
      totalResources,
      // Time-series records for growth charts
      organizationRecords,
      applicationRecords,
      // Grouped data for pie charts (all-time)
      credentialByStandardData,
      auditorTierData,
      credentialStatusData,
      advisorInactiveCount,
      reportRows,
      pendingApplications,
    ] = await Promise.all([
      // All-time totals — no date filter
      prisma.organization.count({ where: baseWhere }),
      prisma.organization.count({ where: { ...baseWhere, accreditationStatus: "ACTIVE" } }),
      prisma.auditor.count({ where: { deletedAt: null } }),
      prisma.credential.count({ where: credentialBaseWhere }),
      prisma.credential.count({ where: { ...credentialBaseWhere, status: "VALID" } }),
      prisma.application.count({ where: baseWhere }),
      prisma.application.count({ where: { ...baseWhere, applicationStatus: "APPROVED" } }),
      prisma.advisor.count({ where: { deletedAt: null } }),
      prisma.advisor.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.resource.count({ where: { deletedAt: null } }),
      // Time-series records (date-filtered for chart bucketing)
      prisma.organization.findMany({ where: { deletedAt: null, createdAt: { gte: startDate, lte: endDate } }, select: { createdAt: true } }),
      prisma.application.findMany({ where: { deletedAt: null, createdAt: { gte: startDate, lte: endDate } }, select: { createdAt: true, applicationStatus: true } }),
      // Pie chart groupings — all-time
      prisma.credential.groupBy({ by: ["standard"], where: credentialBaseWhere, _count: { standard: true } }),
      prisma.auditor.groupBy({ by: ["tier"], where: { deletedAt: null }, _count: { tier: true } }),
      prisma.credential.groupBy({ by: ["status"], where: credentialBaseWhere, _count: { status: true } }),
      prisma.advisor.count({ where: { deletedAt: null, status: "INACTIVE" } }),
      this.getReportRows(query),
      prisma.application.count({ where: { ...baseWhere, applicationStatus: "PENDING" } }),
    ]);

    const organizationGrowth = createTimeSeries(organizationRecords, startDate, endDate, groupByMonth);
    const applicationTrend = createApplicationTrend(applicationRecords, startDate, endDate, groupByMonth);

    const auditorTier = auditorTierData.map((item) => ({ name: item.tier, value: item._count.tier }));
    const credentialStatus = credentialStatusData.map((item) => ({ name: item.status, value: item._count.status }));
    const standardTotals = credentialByStandardData.reduce((acc, item) => acc + item._count.standard, 0);
    const standards = credentialByStandardData
      .sort((a, b) => b._count.standard - a._count.standard)
      .slice(0, 5)
      .map((item) => ({ name: item.standard, percent: standardTotals ? Math.round((item._count.standard / standardTotals) * 100) : 0 }));

    const advisorStats = {
      total: totalAdvisors,
      licensed: activeAdvisors,
      pending: pendingApplications,
      inactive: advisorInactiveCount,
    };

    const metrics = [
      { id: "orgs", title: "Organizations", value: totalOrganizations, delta: 0, trend: "up" },
      { id: "auditors", title: "Auditors", value: totalAuditors, delta: 0, trend: "up" },
      { id: "credentials", title: "Credentials", value: totalCredentials, delta: 0, trend: "up" },
      { id: "pending", title: "Pending Applications", value: await prisma.application.count({ where: { deletedAt: null, applicationStatus: "PENDING" } }), delta: 0, trend: "up" },
      { id: "advisors", title: "Advisors", value: totalAdvisors, delta: 0, trend: "up" },
      { id: "resources", title: "Resources", value: totalResources, delta: 0, trend: "up" },
    ];

    return {
      metrics,
      organizationGrowth,
      auditorTier,
      credentialStatus,
      applicationTrend,
      advisorStats,
      standards,
      reports: reportRows.rows,
    };
  }

  public async getOrganizationSummary(query: AnalyticsQuery) {
    // All-time totals — no date filter on counts
    const base = { deletedAt: null };
    const [totalOrganizations, activeOrganizations, suspendedOrganizations, revokedOrganizations] = await Promise.all([
      prisma.organization.count({ where: base }),
      prisma.organization.count({ where: { ...base, accreditationStatus: "ACTIVE" } }),
      prisma.organization.count({ where: { ...base, accreditationStatus: "SUSPENDED" } }),
      prisma.organization.count({ where: { ...base, accreditationStatus: "REVOKED" } }),
    ]);

    // Time-series records for charts (date-filtered)
    const where = buildWhere(query, "createdAt");
    const organizations = await prisma.organization.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    return {
      totalOrganizations,
      activeOrganizations,
      suspendedOrganizations,
      revokedOrganizations,
      organizations,
    };
  }

  public async getAuditorSummary(query: AnalyticsQuery) {
    // All-time totals
    const base = { deletedAt: null };
    const [totalAuditors, activeAuditors, inactiveAuditors] = await Promise.all([
      prisma.auditor.count({ where: base }),
      prisma.auditor.count({ where: { ...base, status: "ACTIVE" } }),
      prisma.auditor.count({ where: { ...base, status: "INACTIVE" } }),
    ]);

    const auditorsByTierData = await prisma.auditor.groupBy({
      by: ["tier"],
      where: base,
      _count: { tier: true },
    });

    const auditorsByTier = auditorsByTierData.reduce<Record<string, number>>((acc, item) => {
      acc[item.tier] = item._count.tier;
      return acc;
    }, {});

    // Records for time-series (date-filtered)
    const where = buildWhere(query, "createdAt", true);
    const auditors = await prisma.auditor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    return {
      totalAuditors,
      activeAuditors,
      inactiveAuditors,
      auditorsByTier,
      auditors,
    };
  }

  public async getCredentialSummary(query: AnalyticsQuery) {
    // All-time totals
    const base = { deletedAt: null };
    const [totalCredentials, validCredentials, expiredCredentials, revokedCredentials] = await Promise.all([
      prisma.credential.count({ where: base }),
      prisma.credential.count({ where: { ...base, status: "VALID" } }),
      prisma.credential.count({ where: { ...base, status: "EXPIRED" } }),
      prisma.credential.count({ where: { ...base, status: "REVOKED" } }),
    ]);

    const credentialsByStandardData = await prisma.credential.groupBy({
      by: ["standard"],
      where: base,
      _count: { standard: true },
    });

    const credentialsByStandard = credentialsByStandardData.reduce<Record<string, number>>((acc, item) => {
      acc[item.standard] = item._count.standard;
      return acc;
    }, {});

    // Date-filtered for time-series list
    const where = buildWhere(query, "issueDate", true, true);
    const credentials = await prisma.credential.findMany({
      where,
      orderBy: { issueDate: "desc" },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    return {
      totalCredentials,
      validCredentials,
      expiredCredentials,
      revokedCredentials,
      credentialsByStandard,
      credentials,
    };
  }

  public async getApplicationSummary(query: AnalyticsQuery) {
    // All-time totals
    const base = { deletedAt: null };
    const [totalApplications, approvedApplications, rejectedApplications, pendingApplications] = await Promise.all([
      prisma.application.count({ where: base }),
      prisma.application.count({ where: { ...base, applicationStatus: "APPROVED" } }),
      prisma.application.count({ where: { ...base, applicationStatus: "REJECTED" } }),
      prisma.application.count({ where: { ...base, applicationStatus: "PENDING" } }),
    ]);

    // Date-filtered for time-series list
    const where = buildWhere(query, "createdAt");
    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    return {
      totalApplications,
      submittedApplications: pendingApplications,
      approvedApplications,
      rejectedApplications,
      pendingApplications,
      applications,
    };
  }

  public async getAdvisorSummary(query: AnalyticsQuery) {
    // All-time totals
    const base = { deletedAt: null };
    const [totalAdvisors, activeAdvisors, inactiveAdvisors] = await Promise.all([
      prisma.advisor.count({ where: base }),
      prisma.advisor.count({ where: { ...base, status: "ACTIVE" } }),
      prisma.advisor.count({ where: { ...base, status: "INACTIVE" } }),
    ]);

    // Date-filtered for time-series list
    const where = buildWhere(query, "createdAt");
    const advisors = await prisma.advisor.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    return {
      totalAdvisors,
      licensedAdvisors: activeAdvisors,
      pendingAdvisors: 0,
      inactiveAdvisors,
      advisors,
    };
  }

  public async getReportMetadata(query: AnalyticsQuery) {
    const where: any = {};
    const dateFilter = getDateRange(query, "timestamp");
    if (dateFilter) where.timestamp = dateFilter;
    if (query.reportType && query.reportType !== "ALL" && query.reportType !== "AUDIT_LOGS") {
      where.entityType = query.reportType === "OVERVIEW" ? undefined : query.reportType;
    }

    const reports = await prisma.auditLog.findMany({
      where,
      include: { actor: { select: { fullName: true } } },
      orderBy: { timestamp: "desc" },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    return {
      totalReports: reports.length,
      reports,
    };
  }

  public async getAuditLogs(query: AnalyticsQuery) {
    const where: any = {};
    const dateFilter = getDateRange(query, "timestamp");
    if (dateFilter) where.timestamp = dateFilter;
    if (query.reportType && query.reportType !== "ALL" && query.reportType !== "AUDIT_LOGS") {
      where.entityType = query.reportType;
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: { actor: { select: { fullName: true } } },
      orderBy: { timestamp: "desc" },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    return {
      totalEvents: await prisma.auditLog.count({ where }),
      auditLogs,
    };
  }

  public async getResourceSummary(query: AnalyticsQuery) {
    // All-time total
    const base = { deletedAt: null };
    const totalResources = await prisma.resource.count({ where: base });

    const resourcesByCategoryData = await prisma.resource.groupBy({
      by: ["category"],
      where: base,
      _count: { category: true },
    });

    const resourcesByCategory = resourcesByCategoryData.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = item._count.category;
      return acc;
    }, {});

    // Date-filtered for list
    const where = buildWhere(query, "createdAt");
    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    return {
      totalResources,
      resources,
      resourcesByCategory,
    };
  }

  // ─── Training Institutes ─────────────────────────────────────────────
  public async getTrainingInstituteSummary(query: AnalyticsQuery) {
    // All-time totals
    const base = { deletedAt: null };
    const [total, active, suspended, revoked] = await Promise.all([
      prisma.trainingInstitute.count({ where: base }),
      prisma.trainingInstitute.count({ where: { ...base, status: "ACTIVE" } }),
      prisma.trainingInstitute.count({ where: { ...base, status: "SUSPENDED" } }),
      prisma.trainingInstitute.count({ where: { ...base, status: "REVOKED" } }),
    ]);

    // Date-filtered for time-series list
    const where = buildWhere(query, "createdAt");
    const institutes = await prisma.trainingInstitute.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    const statusGroupData = await prisma.trainingInstitute.groupBy({
      by: ["status"],
      where: base,
      _count: { status: true },
    });

    const byStatus = statusGroupData.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {});

    return {
      total,
      active,
      suspended,
      revoked,
      pending: 0, // TrainingInstitute model has no pending status — all come via applications
      byStatus,
      institutes,
    };
  }

  // ─── NEW: /analytics/overview ────────────────────────────────────────
  public async getOverviewStats(query: AnalyticsQuery) {
    const where: any = { deletedAt: null };
    if (query.startDate || query.endDate) {
      const dateFilter: any = {};
      if (query.startDate) dateFilter.gte = query.startDate;
      if (query.endDate) dateFilter.lte = query.endDate;
      where.createdAt = dateFilter;
    }

    const [
      totalOrganizations,
      activeOrganizations,
      suspendedOrganizations,
      revokedOrganizations,
      applications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      credentials,
      certificates,
      trainingInstitutes,
      auditors,
      todaysActivity,
    ] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.count({ where: { ...where, accreditationStatus: "ACTIVE" } }),
      prisma.organization.count({ where: { ...where, accreditationStatus: "SUSPENDED" } }),
      prisma.organization.count({ where: { ...where, accreditationStatus: "REVOKED" } }),
      prisma.application.count({ where }),
      prisma.application.count({ where: { ...where, applicationStatus: "PENDING" } }),
      prisma.application.count({ where: { ...where, applicationStatus: "APPROVED" } }),
      prisma.application.count({ where: { ...where, applicationStatus: "REJECTED" } }),
      prisma.credential.count({ where: { deletedAt: null } }),
      prisma.credential.count({ where: { deletedAt: null, certificateGenerated: true } }),
      prisma.trainingInstitute.count({ where: { deletedAt: null } }),
      prisma.auditor.count({ where: { deletedAt: null } }),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalOrganizations,
      activeOrganizations,
      suspendedOrganizations,
      revokedOrganizations,
      applications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      credentials,
      certificates,
      trainingInstitutes,
      auditors,
      todaysActivity,
      systemHealth: 100,
    };
  }

  // ─── NEW: /analytics/charts ───────────────────────────────────────────
  public async getChartsData(query: AnalyticsQuery) {
    const { startDate, endDate } = resolveRange(query);
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    const groupByMonth = dayCount > 90 || query.dateRange === "LAST_YEAR" || query.dateRange === "LAST_6_MONTHS";

    const dateFilter = { gte: startDate, lte: endDate };

    const [
      applicationRecords,
      credentialRecords,
      organizationsByStatus,
      auditorsByTier,
      orgsByCountry,
      credentialsByStandard,
    ] = await Promise.all([
      prisma.application.findMany({
        where: { deletedAt: null, createdAt: dateFilter },
        select: { createdAt: true, applicationStatus: true },
      }),
      prisma.credential.findMany({
        where: { deletedAt: null, issueDate: dateFilter },
        select: { issueDate: true, certificateGenerated: true },
      }),
      prisma.organization.groupBy({
        by: ["accreditationStatus"],
        where: { deletedAt: null },
        _count: { accreditationStatus: true },
      }),
      prisma.auditor.groupBy({
        by: ["tier"],
        where: { deletedAt: null },
        _count: { tier: true },
      }),
      prisma.organization.groupBy({
        by: ["country"],
        where: { deletedAt: null },
        _count: { country: true },
        orderBy: { _count: { country: "desc" } },
        take: 10,
      }),
      prisma.credential.groupBy({
        by: ["standard"],
        where: { deletedAt: null },
        _count: { standard: true },
        orderBy: { _count: { standard: "desc" } },
        take: 5,
      }),
    ]);

    // Build monthly application trend
    const buckets = createBuckets(startDate, endDate, groupByMonth);
    const appCounts = buckets.reduce<Record<string, number>>((acc, b) => {
      acc[b.key] = 0;
      return acc;
    }, {});
    const credCounts = { ...appCounts };
    const certCounts = { ...appCounts };

    applicationRecords.forEach((r) => {
      const key = bucketKey(new Date(r.createdAt), groupByMonth);
      if (appCounts[key] !== undefined) appCounts[key]++;
    });
    credentialRecords.forEach((r) => {
      const key = bucketKey(new Date(r.issueDate), groupByMonth);
      if (credCounts[key] !== undefined) credCounts[key]++;
      if (r.certificateGenerated) {
        if (certCounts[key] !== undefined) certCounts[key]++;
      }
    });

    const monthlyApplications = buckets.map((b) => ({ x: b.period, y: appCounts[b.key] }));
    const monthlyCredentials = buckets.map((b) => ({ x: b.period, y: credCounts[b.key] }));
    const monthlyCertificates = buckets.map((b) => ({ x: b.period, y: certCounts[b.key] }));

    const organizationStatus = organizationsByStatus.map((item) => ({
      id: item.accreditationStatus,
      label: item.accreditationStatus,
      value: item._count.accreditationStatus,
    }));

    const trainingInstitutes = await prisma.trainingInstitute
      .groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { status: true },
      })
      .then((rows) =>
        rows.map((r) => ({ id: r.status, label: r.status, value: r._count.status }))
      );

    const countryDistribution = orgsByCountry.map((item) => ({
      id: item.country,
      label: item.country,
      value: item._count.country,
    }));

    const topStandards = credentialsByStandard.map((item) => ({
      id: item.standard,
      label: item.standard,
      value: item._count.standard,
    }));

    // Audit trend (last 7 days or period)
    const auditRecords = await prisma.auditLog.findMany({
      where: { createdAt: dateFilter },
      select: { createdAt: true },
    });
    const auditCounts = { ...appCounts };
    auditRecords.forEach((r) => {
      const key = bucketKey(new Date(r.createdAt), groupByMonth);
      if (auditCounts[key] !== undefined) auditCounts[key]++;
    });
    const auditTrend = buckets.map((b) => ({ x: b.period, y: auditCounts[b.key] }));

    const auditorDistribution = auditorsByTier.map((item) => ({
      id: item.tier,
      label: item.tier,
      value: item._count.tier,
    }));

    return {
      monthlyApplications,
      monthlyCredentials,
      monthlyCertificates,
      organizationStatus,
      trainingInstitutes,
      countryDistribution,
      topStandards,
      auditTrend,
      auditorDistribution,
    };
  }

  // ─── NEW: /analytics/recent-activities ───────────────────────────────
  public async getRecentActivities() {
    const [auditLogs, applications, credentials] = await Promise.all([
      prisma.auditLog.findMany({
        where: {},
        include: { actor: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.application.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, fullName: true, applicationType: true, applicationStatus: true, createdAt: true },
      }),
      prisma.credential.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, credentialId: true, standard: true, status: true, createdAt: true },
      }),
    ]);

    const activities: Array<{
      id: string;
      type: "AUDIT_LOG" | "APPLICATION" | "CREDENTIAL" | "CERTIFICATE";
      title: string;
      description: string;
      timestamp: string;
      status?: string;
    }> = [];

    auditLogs.forEach((log) => {
      activities.push({
        id: log.id,
        type: "AUDIT_LOG",
        title: `${log.action ?? "Action"} on ${log.entityType}`,
        description: log.description ?? `By ${log.actor?.fullName ?? "System"} — ${log.entityType} #${log.entityId.slice(0, 8)}`,
        timestamp: (log.timestamp ?? log.createdAt).toISOString(),
        status: log.status,
      });
    });

    applications.forEach((app) => {
      activities.push({
        id: app.id,
        type: "APPLICATION",
        title: `Application from ${app.fullName}`,
        description: `${app.applicationType} — ${app.applicationStatus}`,
        timestamp: app.createdAt.toISOString(),
        status: app.applicationStatus,
      });
    });

    credentials.forEach((cred) => {
      activities.push({
        id: cred.id,
        type: "CREDENTIAL",
        title: `Credential ${cred.credentialId}`,
        description: `Standard: ${cred.standard} — ${cred.status}`,
        timestamp: cred.createdAt.toISOString(),
        status: cred.status,
      });
    });

    // Sort all combined by timestamp desc, take top 15
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return { activities: activities.slice(0, 15) };
  }

  // ─── NEW: /analytics/export/excel ────────────────────────────────────
  public async getExcelExportData(query: AnalyticsQuery) {
    const { rows } = await this.getReportRows(query);
    return rows;
  }

  public async getFilters() {
    const [organizations, standardsData] = await Promise.all([
      prisma.organization.findMany({ where: { deletedAt: null }, select: { id: true, organizationName: true } }),
      prisma.credential.findMany({ where: { deletedAt: null }, select: { standard: true } }),
    ]);

    const standards = Array.from(new Set(standardsData.map((item) => item.standard))).sort();

    return {
      organizations: organizations.map((org) => ({ id: org.id, name: org.organizationName })),
      standards,
      reportTypes: [
        "ALL",
        "OVERVIEW",
        "ORGANIZATIONS",
        "AUDITORS",
        "CREDENTIALS",
        "APPLICATIONS",
        "ADVISORS",
        "RESOURCES",
        "REPORTS",
        "AUDIT_LOGS",
      ],
    };
  }

  public async getReportRows(query: AnalyticsQuery) {
    const where: any = {};
    const dateFilter = getDateRange(query, "timestamp");
    if (dateFilter) where.timestamp = dateFilter;
    if (query.reportType && query.reportType !== "ALL" && query.reportType !== "AUDIT_LOGS") {
      where.entityType = query.reportType;
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      include: { actor: { select: { fullName: true } } },
      orderBy: { timestamp: "desc" },
      take: query.limit,
      skip: (query.page - 1) * query.limit,
    });

    const rows = auditLogs.map((audit) => ({
      id: audit.id,
      timestamp: (audit.timestamp ?? audit.createdAt).toISOString(),
      admin: audit.actor?.fullName || "System",
      action: audit.action,
      entity: audit.entityType,
      details: cleanAuditDetails(audit),
      ip: audit.ipAddress || "-",
    }));

    return {
      rows,
      total: await prisma.auditLog.count({ where }),
    };
  }
}

export default new AnalyticsRepository();



