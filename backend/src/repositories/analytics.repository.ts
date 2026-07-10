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
      case "LAST_7_DAYS":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 6);
        endDate = now;
        break;
      case "LAST_MONTH":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setMonth(startDate.getMonth() - 1);
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
  const details = audit.newData ?? audit.oldData ?? {};
  return typeof details === "string" ? details : JSON.stringify(details);
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
      case "LAST_7_DAYS":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - 6);
        break;
      case "LAST_MONTH":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setMonth(startDate.getMonth() - 1);
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
    const groupByMonth = dayCount > 90 || query.dateRange === "LAST_YEAR";

    const organizationWhere = buildWhere(query, "createdAt");
    const auditorWhere = buildWhere(query, "createdAt", true);
    const credentialWhere = buildWhere(query, "issueDate", true, true);
    const applicationWhere = buildWhere(query, "createdAt");
    const advisorWhere = buildWhere(query, "createdAt");
    const resourceWhere = buildWhere(query, "createdAt");

    const [
      totalOrganizations,
      activeOrganizations,
      totalAuditors,
      totalCredentials,
      validCredentials,
      totalApplications,
      submittedApplications,
      approvedApplications,
      totalAdvisors,
      activeAdvisors,
      totalResources,
      organizationRecords,
      applicationRecords,
      credentialByStandardData,
      auditorTierData,
      credentialStatusData,
      advisorInactiveCount,
      reportRows,
      pendingApplications,
    ] = await Promise.all([
      prisma.organization.count({ where: organizationWhere }),
      prisma.organization.count({ where: { ...organizationWhere, accreditationStatus: "ACTIVE" } }),
      prisma.auditor.count({ where: auditorWhere }),
      prisma.credential.count({ where: credentialWhere }),
      prisma.credential.count({ where: { ...credentialWhere, status: "VALID" } }),
      prisma.application.count({ where: applicationWhere }),
      prisma.application.count({ where: { ...applicationWhere, applicationStatus: "PENDING" } }),
      prisma.application.count({ where: { ...applicationWhere, applicationStatus: "APPROVED" } }),
      prisma.advisor.count({ where: advisorWhere }),
      prisma.advisor.count({ where: { ...advisorWhere, status: "ACTIVE" } }),
      prisma.resource.count({ where: resourceWhere }),
      prisma.organization.findMany({ where: { ...organizationWhere, createdAt: { gte: startDate, lte: endDate } }, select: { createdAt: true } }),
      prisma.application.findMany({ where: { ...applicationWhere, createdAt: { gte: startDate, lte: endDate } }, select: { createdAt: true, applicationStatus: true } }),
      prisma.credential.groupBy({ by: ["standard"], where: credentialWhere, _count: { standard: true } }),
      prisma.auditor.groupBy({ by: ["tier"], where: auditorWhere, _count: { tier: true } }),
      prisma.credential.groupBy({ by: ["status"], where: credentialWhere, _count: { status: true } }),
      prisma.advisor.count({ where: { ...advisorWhere, status: "INACTIVE" } }),
      this.getReportRows(query),
      prisma.application.count({ where: { ...applicationWhere, applicationStatus: "PENDING" } }),
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
    const where = buildWhere(query, "createdAt");
    const [totalOrganizations, activeOrganizations, suspendedOrganizations, revokedOrganizations, organizations] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.count({ where: { ...where, accreditationStatus: "ACTIVE" } }),
      prisma.organization.count({ where: { ...where, accreditationStatus: "SUSPENDED" } }),
      prisma.organization.count({ where: { ...where, accreditationStatus: "REVOKED" } }),
      prisma.organization.findMany({ where, orderBy: { createdAt: "desc" }, take: query.limit, skip: (query.page - 1) * query.limit }),
    ]);

    return {
      totalOrganizations,
      activeOrganizations,
      suspendedOrganizations,
      revokedOrganizations,
      organizations,
    };
  }

  public async getAuditorSummary(query: AnalyticsQuery) {
    const where = buildWhere(query, "createdAt", true);
    const [totalAuditors, activeAuditors, inactiveAuditors, auditors] = await Promise.all([
      prisma.auditor.count({ where }),
      prisma.auditor.count({ where: { ...where, status: "ACTIVE" } }),
      prisma.auditor.count({ where: { ...where, status: "INACTIVE" } }),
      prisma.auditor.findMany({ where, orderBy: { createdAt: "desc" }, take: query.limit, skip: (query.page - 1) * query.limit }),
    ]);

    const auditorsByTierData = await prisma.auditor.groupBy({
      by: ["tier"],
      where,
      _count: { tier: true },
    });

    const auditorsByTier = auditorsByTierData.reduce<Record<string, number>>((acc, item) => {
      acc[item.tier] = item._count.tier;
      return acc;
    }, {});

    return {
      totalAuditors,
      activeAuditors,
      inactiveAuditors,
      auditorsByTier,
      auditors,
    };
  }

  public async getCredentialSummary(query: AnalyticsQuery) {
    const where = buildWhere(query, "issueDate", true, true);
    const [totalCredentials, validCredentials, expiredCredentials, revokedCredentials, credentials] = await Promise.all([
      prisma.credential.count({ where }),
      prisma.credential.count({ where: { ...where, status: "VALID" } }),
      prisma.credential.count({ where: { ...where, status: "EXPIRED" } }),
      prisma.credential.count({ where: { ...where, status: "REVOKED" } }),
      prisma.credential.findMany({ where, orderBy: { issueDate: "desc" }, take: query.limit, skip: (query.page - 1) * query.limit }),
    ]);

    const credentialsByStandardData = await prisma.credential.groupBy({
      by: ["standard"],
      where,
      _count: { standard: true },
    });

    const credentialsByStandard = credentialsByStandardData.reduce<Record<string, number>>((acc, item) => {
      acc[item.standard] = item._count.standard;
      return acc;
    }, {});

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
    const where = buildWhere(query, "createdAt");
    const [totalApplications, submittedApplications, approvedApplications, rejectedApplications, pendingApplications, applications] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.count({ where: { ...where, applicationStatus: "PENDING" } }),
      prisma.application.count({ where: { ...where, applicationStatus: "APPROVED" } }),
      prisma.application.count({ where: { ...where, applicationStatus: "REJECTED" } }),
      prisma.application.count({ where: { ...where, applicationStatus: "PENDING" } }),
      prisma.application.findMany({ where, orderBy: { createdAt: "desc" }, take: query.limit, skip: (query.page - 1) * query.limit }),
    ]);

    return {
      totalApplications,
      submittedApplications,
      approvedApplications,
      rejectedApplications,
      pendingApplications,
      applications,
    };
  }

  public async getAdvisorSummary(query: AnalyticsQuery) {
    const where = buildWhere(query, "createdAt");
    const [totalAdvisors, activeAdvisors, inactiveAdvisors, advisors] = await Promise.all([
      prisma.advisor.count({ where }),
      prisma.advisor.count({ where: { ...where, status: "ACTIVE" } }),
      prisma.advisor.count({ where: { ...where, status: "INACTIVE" } }),
      prisma.advisor.findMany({ where, orderBy: { createdAt: "desc" }, take: query.limit, skip: (query.page - 1) * query.limit }),
    ]);

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
    const where = buildWhere(query, "createdAt");
    const [totalResources, resources] = await Promise.all([
      prisma.resource.count({ where }),
      prisma.resource.findMany({ where, orderBy: { createdAt: "desc" }, take: query.limit, skip: (query.page - 1) * query.limit }),
    ]);

    const resourcesByCategoryData = await prisma.resource.groupBy({
      by: ["category"],
      where,
      _count: { category: true },
    });

    const resourcesByCategory = resourcesByCategoryData.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = item._count.category;
      return acc;
    }, {});

    return {
      totalResources,
      resources,
      resourcesByCategory,
    };
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



