import React, { useMemo } from 'react'
import useAnalytics from '../../../hooks/useAnalytics'
import AnalyticsHeader from './AnalyticsHeader'
import Filters from './Filters'
import MetricCard from './MetricCard'
import ExportButton from './ExportButton'
import VerticalBarChart from './charts/VerticalBarChart'
import PieChart from './charts/PieChart'
import AreaChart from './charts/AreaChart'
import StandardsProgress from './charts/StandardsProgress'
import AdvisorDonutChart from './charts/AdvisorDonutChart'
import ReportTable from './ReportTable'

// Assign colors to credential status values
const CREDENTIAL_STATUS_COLORS: Record<string, string> = {
  VALID: '#10B981',
  EXPIRED: '#F59E0B',
  REVOKED: '#EF4444',
}

// Assign colors to auditor tier values
const AUDITOR_TIER_COLORS: Record<string, string> = {
  LEAD: '#0F3D91',
  SENIOR: '#2563EB',
  ASSOCIATE: '#D4AF37',
}

const STANDARDS_COLORS = ['#0F3D91', '#2563EB', '#D4AF37', '#10B981', '#F59E0B', '#8B5CF6']

// ─── Dynamic graph titles per category ────────────────────────────────────
type CategoryTitles = {
  growth: string
  pieLeft: string
  pieRight: string
  credStatus: string
  advisorChart: string
  trend: string
}

const CATEGORY_TITLES: Record<string, CategoryTitles> = {
  ALL: {
    growth: 'Organization Growth Over Time',
    pieLeft: 'Auditor Tier Distribution',
    pieRight: 'Top Standards by Adoption',
    credStatus: 'Credential Status',
    advisorChart: 'Advisor Statistics',
    trend: 'Applications Trend',
  },
  OVERVIEW: {
    growth: 'Organization Growth Over Time',
    pieLeft: 'Auditor Tier Distribution',
    pieRight: 'Top Standards by Adoption',
    credStatus: 'Credential Status',
    advisorChart: 'Advisor Statistics',
    trend: 'Applications Trend',
  },
  ORGANIZATIONS: {
    growth: 'Organization Growth',
    pieLeft: 'Organization Status',
    pieRight: 'Organization Status Distribution',
    credStatus: 'Organization Status',
    advisorChart: 'Organizations by Status',
    trend: 'Organization Activity Over Time',
  },
  APPLICATIONS: {
    growth: 'Application Growth',
    pieLeft: 'Application Status',
    pieRight: 'Applications by Type',
    credStatus: 'Application Status Distribution',
    advisorChart: 'Application Summary',
    trend: 'Applications per Month',
  },
  CREDENTIALS: {
    growth: 'Credential Issuance Trend',
    pieLeft: 'Credential Status',
    pieRight: 'Standards Distribution',
    credStatus: 'Credential Status Distribution',
    advisorChart: 'Credential Summary',
    trend: 'Credentials Issued Over Time',
  },
  AUDITORS: {
    growth: 'Auditor Growth',
    pieLeft: 'Auditor Tier Distribution',
    pieRight: 'Auditor Tier Distribution',
    credStatus: 'Auditor Tier',
    advisorChart: 'Auditor Summary',
    trend: 'Auditor Registrations Over Time',
  },
  ADVISORS: {
    growth: 'Advisory Board Growth',
    pieLeft: 'Advisory Member Status',
    pieRight: 'Advisory Member Status',
    credStatus: 'Advisory Status Distribution',
    advisorChart: 'Advisory Board Summary',
    trend: 'Advisory Member Growth Over Time',
  },
  AUDIT_LOGS: {
    growth: 'Audit Activity Trend',
    pieLeft: 'Action Type Distribution',
    pieRight: 'Action Type Breakdown',
    credStatus: 'Recent System Events',
    advisorChart: 'Audit Log Summary',
    trend: 'User Activity Over Time',
  },
  TRAINING_INSTITUTES: {
    growth: 'Training Institute Growth',
    pieLeft: 'Institute Status Distribution',
    pieRight: 'Institute Accreditation Distribution',
    credStatus: 'Institute Status',
    advisorChart: 'Institute Summary',
    trend: 'Training Institute Registrations Over Time',
  },
  REPORTS: {
    growth: 'Resource Activity',
    pieLeft: 'Resources by Category',
    pieRight: 'Resources by Category',
    credStatus: 'Category Distribution',
    advisorChart: 'Resource Summary',
    trend: 'Resource Activity Over Time',
  },
  RESOURCES: {
    growth: 'Resource Activity',
    pieLeft: 'Resources by Category',
    pieRight: 'Resources by Category',
    credStatus: 'Category Distribution',
    advisorChart: 'Resource Summary',
    trend: 'Resource Activity Over Time',
  },
}

const getTitles = (reportType?: string): CategoryTitles =>
  CATEGORY_TITLES[reportType ?? 'ALL'] ?? CATEGORY_TITLES['ALL']

// ─── Submitted / Approved legend label overrides per category ─────────────
const AREA_LEGEND: Record<string, { submitted: string; approved: string }> = {
  APPLICATIONS: { submitted: 'Submitted', approved: 'Approved' },
  CREDENTIALS: { submitted: 'Issued', approved: 'Issued' },
  AUDITORS: { submitted: 'Registered', approved: '' },
  ADVISORS: { submitted: 'Joined', approved: '' },
  AUDIT_LOGS: { submitted: 'Events', approved: '' },
  ORGANIZATIONS: { submitted: 'Registered', approved: '' },
}
const getAreaLegend = (reportType?: string) =>
  AREA_LEGEND[reportType ?? 'ALL'] ?? { submitted: 'Submitted', approved: 'Approved' }

export default function AnalyticsDashboard() {
  const {
    metrics,
    organizationGrowth,
    auditorTier,
    credentialStatus,
    applicationTrend,
    standards,
    advisorStats,
    reports,
    filters,
    loading,
    error,
    refresh,
    applyFilters,
    resetFilters,
    queryParams,
  } = useAnalytics()

  const reportType = queryParams?.reportType ?? 'ALL'
  const titles = getTitles(reportType)
  const areaLegend = getAreaLegend(reportType)

  // Enrich credentialStatus with proper colors
  const credentialStatusColored = useMemo(
    () =>
      credentialStatus
        ? credentialStatus.map((item) => ({
            ...item,
            color: item.color ?? CREDENTIAL_STATUS_COLORS[item.name] ?? '#6B7280',
          }))
        : null,
    [credentialStatus],
  )

  // Enrich auditorTier with proper colors
  const auditorTierColored = useMemo(
    () =>
      auditorTier
        ? auditorTier.map((item) => ({
            ...item,
            color: item.color ?? AUDITOR_TIER_COLORS[item.name] ?? '#6B7280',
          }))
        : null,
    [auditorTier],
  )

  // Enrich standards with colors
  const standardsColored = useMemo(
    () =>
      standards
        ? standards.map((item, idx) => ({
            ...item,
            color: item.color ?? STANDARDS_COLORS[idx % STANDARDS_COLORS.length],
          }))
        : null,
    [standards],
  )

  if (error)
    return (
      <div className="p-6">
        <div className="bg-white p-8 rounded-2xl text-center">
          <h3 className="text-lg font-semibold text-slate-800">Failed to load analytics</h3>
          <p className="text-sm text-slate-500 mt-1">{error}</p>
          <button
            onClick={refresh}
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen space-y-6">
      {/* Header */}
      <AnalyticsHeader onRefresh={refresh} />

      {/* Filters + Actions row */}
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div className="flex-1">
          <Filters
            filters={filters}
            values={queryParams}
            onApply={applyFilters}
            onReset={resetFilters}
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ExportButton params={queryParams} />
          <button
            onClick={refresh}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 transition"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Row 1 — Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-[16px] border border-slate-200 animate-pulse" />
          ))}
        {!loading && metrics && metrics.map((m) => <MetricCard key={m.id} metric={m} />)}
      </div>

      {/* Row 2 — Growth chart (full width) */}
      <div className="space-y-2">
        <h4 className="text-base font-semibold text-slate-800">{titles.growth}</h4>
        {organizationGrowth && <VerticalBarChart data={organizationGrowth} />}
      </div>

      {/* Row 3 — Pie left + Standards/Progress right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="text-base font-semibold text-slate-800">{titles.pieLeft}</h4>
          {auditorTierColored && <PieChart data={auditorTierColored} inner={65} />}
        </div>
        <div className="space-y-2">
          <h4 className="text-base font-semibold text-slate-800">{titles.pieRight}</h4>
          {standardsColored && standardsColored.length > 0 ? (
            <StandardsProgress data={standardsColored} />
          ) : (
            <div className="bg-white rounded-2xl p-5 border text-center text-slate-400 text-sm">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Row 4 — Credential/Status Pie left + Advisor/Summary right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h4 className="text-base font-semibold text-slate-800">{titles.credStatus}</h4>
          {credentialStatusColored && <PieChart data={credentialStatusColored} inner={65} />}
        </div>
        <div className="space-y-2">
          <h4 className="text-base font-semibold text-slate-800">{titles.advisorChart}</h4>
          {advisorStats && <AdvisorDonutChart stats={advisorStats} />}
        </div>
      </div>

      {/* Row 5 — Trend chart (full width) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold text-slate-800">{titles.trend}</h4>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {areaLegend.submitted && (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                {areaLegend.submitted}
              </span>
            )}
            {areaLegend.approved && (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                {areaLegend.approved}
              </span>
            )}
          </div>
        </div>
        {applicationTrend && <AreaChart data={applicationTrend} />}
      </div>

      {/* Row 6 — Recent Activity Table */}
      <ReportTable rows={reports ?? []} queryParams={queryParams} />
    </div>
  )
}
