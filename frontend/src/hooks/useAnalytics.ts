import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '../services/api/analytics.api'
import type {
  AnalyticsFilters,
  AnalyticsQueryParams,
  AnalyticsDashboardData,
  Metric,
  OrganizationPoint,
  AuditorTier,
  CredentialStatusItem,
  ApplicationPoint,
  AdvisorStat,
  StandardAdoption,
  ReportRow,
} from '../types/analytics'

// ─── Color constants shared with dashboard ────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#10B981',
  APPROVED: '#10B981',
  VALID: '#10B981',
  PENDING: '#F59E0B',
  SUSPENDED: '#F59E0B',
  INACTIVE: '#6B7280',
  EXPIRED: '#F59E0B',
  REVOKED: '#EF4444',
  REJECTED: '#EF4444',
  LEAD: '#0F3D91',
  SENIOR: '#2563EB',
  ASSOCIATE: '#D4AF37',
}

const STANDARDS_COLORS = ['#0F3D91', '#2563EB', '#D4AF37', '#10B981', '#F59E0B', '#8B5CF6']

// ─── Helper: build empty time-series buckets for a date range ─────────────
function buildEmptyBuckets(params: AnalyticsQueryParams): { period: string; count: number }[] {
  const now = new Date()
  let start: Date
  switch (params.dateRange) {
    case 'TODAY':
      start = new Date(now); start.setHours(0, 0, 0, 0); break
    case 'LAST_7_DAYS':
      start = new Date(now); start.setDate(start.getDate() - 6); break
    case 'LAST_MONTH':
      start = new Date(now); start.setDate(start.getDate() - 29); break
    case 'LAST_90_DAYS':
      start = new Date(now); start.setDate(start.getDate() - 89); break
    case 'LAST_6_MONTHS':
      start = new Date(now); start.setMonth(start.getMonth() - 6); break
    case 'LAST_YEAR':
      start = new Date(now.getFullYear() - 1, now.getMonth(), 1); break
    default:
      start = new Date(now); start.setDate(start.getDate() - 29); break
  }
  const groupByMonth = (
    params.dateRange === 'LAST_YEAR' ||
    params.dateRange === 'LAST_6_MONTHS' ||
    params.dateRange === 'LAST_90_DAYS'
  )
  const buckets: { period: string; count: number }[] = []
  const cur = new Date(start)
  while (cur <= now) {
    buckets.push({
      period: groupByMonth
        ? cur.toLocaleString('en-US', { month: 'short', year: 'numeric' })
        : `${cur.getMonth() + 1}/${cur.getDate()}`,
      count: 0,
    })
    if (groupByMonth) {
      cur.setMonth(cur.getMonth() + 1)
    } else {
      cur.setDate(cur.getDate() + 1)
    }
  }
  return buckets
}

// ─── Normalise OVERVIEW (existing /analytics/dashboard response) ──────────
function normaliseOverview(data: AnalyticsDashboardData): AnalyticsDashboardData {
  return data
}

// ─── Normalise ORGANIZATIONS ──────────────────────────────────────────────
function normaliseOrganizations(raw: any, params: AnalyticsQueryParams): AnalyticsDashboardData {
  const metrics: Metric[] = [
    { id: 'orgs', title: 'Total Organizations', value: raw.totalOrganizations ?? 0, delta: 0, trend: 'up' },
    { id: 'active', title: 'Active Organizations', value: raw.activeOrganizations ?? 0, delta: 0, trend: 'up' },
    { id: 'suspended', title: 'Suspended', value: raw.suspendedOrganizations ?? 0, delta: 0, trend: 'down' },
    { id: 'revoked', title: 'Revoked', value: raw.revokedOrganizations ?? 0, delta: 0, trend: 'down' },
  ]
  const orgList: any[] = raw.organizations ?? []
  const buckets = buildEmptyBuckets(params)
  orgList.forEach((o) => {
    const d = new Date(o.createdAt)
    const period = (params.dateRange === 'LAST_YEAR')
      ? d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      : `${d.getMonth() + 1}/${d.getDate()}`
    const b = buckets.find((b) => b.period === period)
    if (b) b.count++
  })
  const statusData = [
    { name: 'ACTIVE', value: raw.activeOrganizations ?? 0, color: STATUS_COLORS.ACTIVE },
    { name: 'SUSPENDED', value: raw.suspendedOrganizations ?? 0, color: STATUS_COLORS.SUSPENDED },
    { name: 'REVOKED', value: raw.revokedOrganizations ?? 0, color: STATUS_COLORS.REVOKED },
  ].filter((s) => s.value > 0)
  return {
    metrics,
    organizationGrowth: buckets,
    auditorTier: statusData,
    credentialStatus: statusData,
    applicationTrend: buckets.map((b) => ({ period: b.period, submitted: b.count, approved: 0 })),
    standards: [],
    advisorStats: { total: raw.totalOrganizations ?? 0, licensed: raw.activeOrganizations ?? 0, pending: raw.suspendedOrganizations ?? 0, inactive: raw.revokedOrganizations ?? 0 },
    reports: [],
  }
}

// ─── Normalise APPLICATIONS ───────────────────────────────────────────────
function normaliseApplications(raw: any, params: AnalyticsQueryParams): AnalyticsDashboardData {
  const metrics: Metric[] = [
    { id: 'pending', title: 'Total Applications', value: raw.totalApplications ?? 0, delta: 0, trend: 'up' },
    { id: 'submitted', title: 'Pending', value: raw.pendingApplications ?? raw.submittedApplications ?? 0, delta: 0, trend: 'up' },
    { id: 'approved', title: 'Approved', value: raw.approvedApplications ?? 0, delta: 0, trend: 'up' },
    { id: 'rejected', title: 'Rejected', value: raw.rejectedApplications ?? 0, delta: 0, trend: 'down' },
  ]
  const appList: any[] = raw.applications ?? []
  const buckets = buildEmptyBuckets(params)
  appList.forEach((a) => {
    const d = new Date(a.createdAt)
    const period = (params.dateRange === 'LAST_YEAR')
      ? d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      : `${d.getMonth() + 1}/${d.getDate()}`
    const b = buckets.find((b) => b.period === period)
    if (b) b.count++
  })
  const statusData = [
    { name: 'PENDING', value: raw.pendingApplications ?? raw.submittedApplications ?? 0, color: STATUS_COLORS.PENDING },
    { name: 'APPROVED', value: raw.approvedApplications ?? 0, color: STATUS_COLORS.APPROVED },
    { name: 'REJECTED', value: raw.rejectedApplications ?? 0, color: STATUS_COLORS.REJECTED },
  ].filter((s) => s.value > 0)
  // Application type breakdown for standards-style progress
  const typeMap: Record<string, number> = {}
  appList.forEach((a) => {
    if (a.applicationType) typeMap[a.applicationType] = (typeMap[a.applicationType] ?? 0) + 1
  })
  const total = Object.values(typeMap).reduce((s, v) => s + v, 0)
  const standardsData: StandardAdoption[] = Object.entries(typeMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count], idx) => ({
      name,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      color: STANDARDS_COLORS[idx % STANDARDS_COLORS.length],
    }))
  return {
    metrics,
    organizationGrowth: buckets,
    auditorTier: statusData,
    credentialStatus: statusData,
    applicationTrend: buckets.map((b) => ({
      period: b.period,
      submitted: b.count,
      approved: Math.floor(b.count * (raw.approvedApplications / Math.max(raw.totalApplications, 1))),
    })),
    standards: standardsData,
    advisorStats: { total: raw.totalApplications ?? 0, licensed: raw.approvedApplications ?? 0, pending: raw.pendingApplications ?? raw.submittedApplications ?? 0, inactive: raw.rejectedApplications ?? 0 },
    reports: [],
  }
}

// ─── Normalise CREDENTIALS ────────────────────────────────────────────────
function normaliseCredentials(raw: any, params: AnalyticsQueryParams): AnalyticsDashboardData {
  const metrics: Metric[] = [
    { id: 'credentials', title: 'Total Issued', value: raw.totalCredentials ?? 0, delta: 0, trend: 'up' },
    { id: 'valid', title: 'Active / Valid', value: raw.validCredentials ?? 0, delta: 0, trend: 'up' },
    { id: 'expired', title: 'Expired', value: raw.expiredCredentials ?? 0, delta: 0, trend: 'down' },
    { id: 'revoked', title: 'Revoked', value: raw.revokedCredentials ?? 0, delta: 0, trend: 'down' },
  ]
  const credList: any[] = raw.credentials ?? []
  const buckets = buildEmptyBuckets(params)
  credList.forEach((c) => {
    const d = new Date(c.issueDate ?? c.createdAt)
    const period = (params.dateRange === 'LAST_YEAR')
      ? d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      : `${d.getMonth() + 1}/${d.getDate()}`
    const b = buckets.find((b) => b.period === period)
    if (b) b.count++
  })
  const statusData = [
    { name: 'VALID', value: raw.validCredentials ?? 0, color: STATUS_COLORS.VALID },
    { name: 'EXPIRED', value: raw.expiredCredentials ?? 0, color: STATUS_COLORS.EXPIRED },
    { name: 'REVOKED', value: raw.revokedCredentials ?? 0, color: STATUS_COLORS.REVOKED },
  ].filter((s) => s.value > 0)
  const standardsMap = raw.credentialsByStandard ?? {}
  const stdTotal = Object.values(standardsMap as Record<string, number>).reduce((s, v) => s + v, 0)
  const standardsData: StandardAdoption[] = Object.entries(standardsMap as Record<string, number>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count], idx) => ({
      name,
      percent: stdTotal > 0 ? Math.round((count / stdTotal) * 100) : 0,
      color: STANDARDS_COLORS[idx % STANDARDS_COLORS.length],
    }))
  return {
    metrics,
    organizationGrowth: buckets,
    auditorTier: statusData,
    credentialStatus: statusData,
    applicationTrend: buckets.map((b) => ({ period: b.period, submitted: b.count, approved: b.count })),
    standards: standardsData,
    advisorStats: { total: raw.totalCredentials ?? 0, licensed: raw.validCredentials ?? 0, pending: 0, inactive: (raw.expiredCredentials ?? 0) + (raw.revokedCredentials ?? 0) },
    reports: [],
  }
}

// ─── Normalise AUDITORS ────────────────────────────────────────────────────
function normaliseAuditors(raw: any, params: AnalyticsQueryParams): AnalyticsDashboardData {
  const tierMap = raw.auditorsByTier ?? {}
  const metrics: Metric[] = [
    { id: 'auditors', title: 'Total Auditors', value: raw.totalAuditors ?? 0, delta: 0, trend: 'up' },
    { id: 'lead', title: 'Lead Auditors', value: tierMap['LEAD'] ?? 0, delta: 0, trend: 'up' },
    { id: 'senior', title: 'Senior Auditors', value: tierMap['SENIOR'] ?? 0, delta: 0, trend: 'up' },
    { id: 'associate', title: 'Associate Auditors', value: tierMap['ASSOCIATE'] ?? 0, delta: 0, trend: 'up' },
  ]
  const auditorList: any[] = raw.auditors ?? []
  const buckets = buildEmptyBuckets(params)
  auditorList.forEach((a) => {
    const d = new Date(a.createdAt)
    const period = (params.dateRange === 'LAST_YEAR')
      ? d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      : `${d.getMonth() + 1}/${d.getDate()}`
    const b = buckets.find((b) => b.period === period)
    if (b) b.count++
  })
  const tierData = Object.entries(tierMap as Record<string, number>)
    .map(([name, value], idx) => ({ name, value, color: STATUS_COLORS[name] ?? STANDARDS_COLORS[idx] }))
  return {
    metrics,
    organizationGrowth: buckets,
    auditorTier: tierData,
    credentialStatus: tierData,
    applicationTrend: buckets.map((b) => ({ period: b.period, submitted: b.count, approved: 0 })),
    standards: [],
    advisorStats: { total: raw.totalAuditors ?? 0, licensed: raw.activeAuditors ?? 0, pending: 0, inactive: raw.inactiveAuditors ?? 0 },
    reports: [],
  }
}

// ─── Normalise ADVISORY ────────────────────────────────────────────────────
function normaliseAdvisory(raw: any, params: AnalyticsQueryParams): AnalyticsDashboardData {
  const metrics: Metric[] = [
    { id: 'advisors', title: 'Total Members', value: raw.totalAdvisors ?? 0, delta: 0, trend: 'up' },
    { id: 'active', title: 'Active Members', value: raw.licensedAdvisors ?? 0, delta: 0, trend: 'up' },
    { id: 'pending', title: 'Pending', value: raw.pendingAdvisors ?? 0, delta: 0, trend: 'up' },
    { id: 'inactive', title: 'Inactive', value: raw.inactiveAdvisors ?? 0, delta: 0, trend: 'down' },
  ]
  const advisorList: any[] = raw.advisors ?? []
  const buckets = buildEmptyBuckets(params)
  advisorList.forEach((a) => {
    const d = new Date(a.createdAt)
    const period = (params.dateRange === 'LAST_YEAR')
      ? d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      : `${d.getMonth() + 1}/${d.getDate()}`
    const b = buckets.find((b) => b.period === period)
    if (b) b.count++
  })
  const statusData = [
    { name: 'Active', value: raw.licensedAdvisors ?? 0, color: STATUS_COLORS.ACTIVE },
    { name: 'Pending', value: raw.pendingAdvisors ?? 0, color: STATUS_COLORS.PENDING },
    { name: 'Inactive', value: raw.inactiveAdvisors ?? 0, color: STATUS_COLORS.INACTIVE },
  ].filter((s) => s.value > 0)
  return {
    metrics,
    organizationGrowth: buckets,
    auditorTier: statusData,
    credentialStatus: statusData,
    applicationTrend: buckets.map((b) => ({ period: b.period, submitted: b.count, approved: 0 })),
    standards: [],
    advisorStats: { total: raw.totalAdvisors ?? 0, licensed: raw.licensedAdvisors ?? 0, pending: raw.pendingAdvisors ?? 0, inactive: raw.inactiveAdvisors ?? 0 },
    reports: [],
  }
}

// ─── Normalise AUDIT_LOGS ──────────────────────────────────────────────────
function normaliseAuditLogs(raw: any, params: AnalyticsQueryParams): AnalyticsDashboardData {
  const logs: any[] = raw.auditLogs ?? []
  const metrics: Metric[] = [
    { id: 'orgs', title: 'Total Events', value: raw.totalEvents ?? logs.length, delta: 0, trend: 'up' },
    { id: 'auditors', title: 'Login Events', value: logs.filter((l) => l.action === 'LOGIN').length, delta: 0, trend: 'up' },
    { id: 'credentials', title: 'Create Events', value: logs.filter((l) => l.action === 'CREATE').length, delta: 0, trend: 'up' },
    { id: 'pending', title: 'Delete Events', value: logs.filter((l) => l.action === 'DELETE').length, delta: 0, trend: 'down' },
  ]
  const buckets = buildEmptyBuckets(params)
  logs.forEach((l) => {
    const d = new Date(l.timestamp ?? l.createdAt)
    const period = (params.dateRange === 'LAST_YEAR')
      ? d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      : `${d.getMonth() + 1}/${d.getDate()}`
    const b = buckets.find((b) => b.period === period)
    if (b) b.count++
  })
  const actionMap: Record<string, number> = {}
  logs.forEach((l) => { if (l.action) actionMap[l.action] = (actionMap[l.action] ?? 0) + 1 })
  const actionData = Object.entries(actionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], idx) => ({ name, value, color: STANDARDS_COLORS[idx % STANDARDS_COLORS.length] }))
  const total = Object.values(actionMap).reduce((s, v) => s + v, 0)
  const standardsData: StandardAdoption[] = Object.entries(actionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count], idx) => ({
      name,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      color: STANDARDS_COLORS[idx % STANDARDS_COLORS.length],
    }))
  const reports: ReportRow[] = logs.slice(0, 20).map((l) => ({
    id: l.id,
    timestamp: (l.timestamp ?? l.createdAt),
    admin: l.actor?.fullName ?? 'System',
    action: l.action ?? '',
    entity: l.entityType ?? '',
    details: l.description ?? '',
    ip: l.ipAddress ?? '-',
  }))
  return {
    metrics,
    organizationGrowth: buckets,
    auditorTier: actionData,
    credentialStatus: actionData,
    applicationTrend: buckets.map((b) => ({ period: b.period, submitted: b.count, approved: 0 })),
    standards: standardsData,
    advisorStats: { total: raw.totalEvents ?? logs.length, licensed: logs.filter((l) => l.action === 'LOGIN').length, pending: logs.filter((l) => l.action === 'CREATE').length, inactive: logs.filter((l) => l.action === 'DELETE').length },
    reports,
  }
}

// ─── Normalise TRAINING INSTITUTES ───────────────────────────────────────
function normaliseTrainingInstitutes(raw: any, params: AnalyticsQueryParams): AnalyticsDashboardData {
  const metrics: Metric[] = [
    { id: 'orgs', title: 'Total Institutes', value: raw.total ?? 0, delta: 0, trend: 'up' },
    { id: 'active', title: 'Active', value: raw.active ?? 0, delta: 0, trend: 'up' },
    { id: 'suspended', title: 'Suspended', value: raw.suspended ?? 0, delta: 0, trend: 'down' },
    { id: 'revoked', title: 'Revoked / Inactive', value: raw.revoked ?? 0, delta: 0, trend: 'down' },
  ]
  const instituteList: any[] = raw.institutes ?? []
  const buckets = buildEmptyBuckets(params)
  const groupByMonth = (
    params.dateRange === 'LAST_YEAR' ||
    params.dateRange === 'LAST_6_MONTHS' ||
    params.dateRange === 'LAST_90_DAYS'
  )
  instituteList.forEach((inst) => {
    const d = new Date(inst.createdAt)
    const period = groupByMonth
      ? d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
      : `${d.getMonth() + 1}/${d.getDate()}`
    const b = buckets.find((b) => b.period === period)
    if (b) b.count++
  })
  const statusMap = raw.byStatus ?? {}
  const statusData = Object.entries(statusMap as Record<string, number>)
    .map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] ?? '#6B7280',
    }))
    .filter((s) => s.value > 0)
  const statusTotal = Object.values(statusMap as Record<string, number>).reduce((s, v) => s + v, 0)
  const standardsData: StandardAdoption[] = Object.entries(statusMap as Record<string, number>)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], idx) => ({
      name,
      percent: statusTotal > 0 ? Math.round((count / statusTotal) * 100) : 0,
      color: STANDARDS_COLORS[idx % STANDARDS_COLORS.length],
    }))
  return {
    metrics,
    organizationGrowth: buckets,
    auditorTier: statusData.length > 0 ? statusData : [
      { name: 'ACTIVE', value: raw.active ?? 0, color: STATUS_COLORS.ACTIVE },
      { name: 'SUSPENDED', value: raw.suspended ?? 0, color: STATUS_COLORS.SUSPENDED },
      { name: 'REVOKED', value: raw.revoked ?? 0, color: STATUS_COLORS.REVOKED },
    ].filter((s) => s.value > 0),
    credentialStatus: statusData.length > 0 ? statusData : [
      { name: 'ACTIVE', value: raw.active ?? 0, color: STATUS_COLORS.ACTIVE },
      { name: 'SUSPENDED', value: raw.suspended ?? 0, color: STATUS_COLORS.SUSPENDED },
      { name: 'REVOKED', value: raw.revoked ?? 0, color: STATUS_COLORS.REVOKED },
    ].filter((s) => s.value > 0),
    applicationTrend: buckets.map((b) => ({ period: b.period, submitted: b.count, approved: 0 })),
    standards: standardsData,
    advisorStats: {
      total: raw.total ?? 0,
      licensed: raw.active ?? 0,
      pending: raw.pending ?? 0,
      inactive: raw.suspended ?? 0,
    },
    reports: [],
  }
}

// ─── Normalise REPORTS / RESOURCES ────────────────────────────────────────
function normaliseResources(raw: any, params: AnalyticsQueryParams): AnalyticsDashboardData {
  const resList: any[] = raw.resources ?? []
  const metrics: Metric[] = [
    { id: 'resources', title: 'Total Resources', value: raw.totalResources ?? 0, delta: 0, trend: 'up' },
  ]
  const catMap = raw.resourcesByCategory ?? {}
  const catTotal = Object.values(catMap as Record<string, number>).reduce((s, v) => s + v, 0)
  const standardsData: StandardAdoption[] = Object.entries(catMap as Record<string, number>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count], idx) => ({
      name,
      percent: catTotal > 0 ? Math.round((count / catTotal) * 100) : 0,
      color: STANDARDS_COLORS[idx % STANDARDS_COLORS.length],
    }))
  const catPie = Object.entries(catMap as Record<string, number>).map(([name, value], idx) => ({ name, value, color: STANDARDS_COLORS[idx % STANDARDS_COLORS.length] }))
  const buckets = buildEmptyBuckets(params)
  return {
    metrics,
    organizationGrowth: buckets,
    auditorTier: catPie,
    credentialStatus: catPie,
    applicationTrend: buckets.map((b) => ({ period: b.period, submitted: 0, approved: 0 })),
    standards: standardsData,
    advisorStats: { total: raw.totalResources ?? 0, licensed: 0, pending: 0, inactive: 0 },
    reports: [],
  }
}

// ─── Main default-export hook ─────────────────────────────────────────────
export default function useAnalytics() {
  const [metrics, setMetrics] = useState<Metric[] | null>(null)
  const [organizationGrowth, setOrganizationGrowth] = useState<OrganizationPoint[] | null>(null)
  const [auditorTier, setAuditorTier] = useState<AuditorTier[] | null>(null)
  const [credentialStatus, setCredentialStatus] = useState<CredentialStatusItem[] | null>(null)
  const [applicationTrend, setApplicationTrend] = useState<ApplicationPoint[] | null>(null)
  const [advisorStats, setAdvisorStats] = useState<AdvisorStat | null>(null)
  const [standards, setStandards] = useState<StandardAdoption[] | null>(null)
  const [reports, setReports] = useState<ReportRow[] | null>(null)
  const [filters, setFilters] = useState<AnalyticsFilters | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [queryParams, setQueryParams] = useState<AnalyticsQueryParams>({})

  const applyData = useCallback((data: AnalyticsDashboardData) => {
    setMetrics(data.metrics)
    setOrganizationGrowth(data.organizationGrowth)
    setAuditorTier(data.auditorTier)
    setCredentialStatus(data.credentialStatus)
    setApplicationTrend(data.applicationTrend)
    setAdvisorStats(data.advisorStats)
    setStandards(data.standards)
    setReports(data.reports)
  }, [])

  const loadFilters = useCallback(async () => {
    try {
      const response = await analyticsApi.getFilters()
      setFilters(response.data.data)
    } catch (err: any) {
      console.error('Unable to fetch analytics filters', err)
    }
  }, [])

  const fetchDashboard = useCallback(async (params: AnalyticsQueryParams = {}) => {
    setLoading(true)
    setError(null)
    try {
      setQueryParams(params)
      const reportType = params.reportType ?? 'ALL'

      let normalised: AnalyticsDashboardData

      if (!reportType || reportType === 'ALL' || reportType === 'OVERVIEW') {
        // Default: full overview dashboard
        const response = await analyticsApi.getDashboard(params)
        normalised = normaliseOverview(response.data.data as AnalyticsDashboardData)

      } else if (reportType === 'ORGANIZATIONS') {
        const response = await analyticsApi.getOrganizationSummary(params)
        normalised = normaliseOrganizations(response.data.data, params)

      } else if (reportType === 'APPLICATIONS') {
        const response = await analyticsApi.getApplicationSummary(params)
        normalised = normaliseApplications(response.data.data, params)

      } else if (reportType === 'CREDENTIALS') {
        const response = await analyticsApi.getCredentialSummary(params)
        normalised = normaliseCredentials(response.data.data, params)

      } else if (reportType === 'AUDITORS') {
        const response = await analyticsApi.getAuditorSummary(params)
        normalised = normaliseAuditors(response.data.data, params)

      } else if (reportType === 'ADVISORS') {
        const response = await analyticsApi.getAdvisorSummary(params)
        normalised = normaliseAdvisory(response.data.data, params)

      } else if (reportType === 'AUDIT_LOGS') {
        const response = await analyticsApi.getAuditLogs(params)
        normalised = normaliseAuditLogs(response.data.data, params)

      } else if (reportType === 'RESOURCES' || reportType === 'REPORTS') {
        const response = await analyticsApi.getResourceSummary(params)
        normalised = normaliseResources(response.data.data, params)

      } else if (reportType === 'TRAINING_INSTITUTES') {
        const response = await analyticsApi.getTrainingInstituteSummary(params)
        normalised = normaliseTrainingInstitutes(response.data.data, params)

      } else {
        // Fallback to overview
        const response = await analyticsApi.getDashboard(params)
        normalised = normaliseOverview(response.data.data as AnalyticsDashboardData)
      }

      applyData(normalised)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [applyData])

  const refresh = useCallback(() => fetchDashboard(queryParams), [fetchDashboard, queryParams])

  const applyFilters = useCallback(
    (params: AnalyticsQueryParams) => {
      fetchDashboard(params)
    },
    [fetchDashboard],
  )

  const resetFilters = useCallback(() => {
    setQueryParams({})
    fetchDashboard({})
  }, [fetchDashboard])

  useEffect(() => {
    loadFilters()
    fetchDashboard()
  }, [loadFilters, fetchDashboard])

  return {
    metrics,
    organizationGrowth,
    auditorTier,
    credentialStatus,
    applicationTrend,
    advisorStats,
    standards,
    reports,
    filters,
    loading,
    error,
    refresh,
    applyFilters,
    resetFilters,
    queryParams,
  }
}

// ─── Named React Query exports (kept for compatibility) ───────────────────
const defaultOptions = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  retry: 2,
  refetchOnWindowFocus: false,
}

export const useAnalyticsOverview = (filters?: any) => {
  return useQuery({
    queryKey: ['analytics', 'overview', filters],
    queryFn: () => analyticsApi.getOverview(filters),
    ...defaultOptions,
  })
}

export const useAnalyticsCharts = (filters?: any) => {
  return useQuery({
    queryKey: ['analytics', 'charts', filters],
    queryFn: () => analyticsApi.getCharts(filters),
    ...defaultOptions,
  })
}

export const useRecentActivities = () => {
  return useQuery({
    queryKey: ['analytics', 'recent-activities'],
    queryFn: () => analyticsApi.getRecentActivities(),
    ...defaultOptions,
  })
}
