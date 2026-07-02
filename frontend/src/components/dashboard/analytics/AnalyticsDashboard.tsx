import React from 'react'
import useAnalytics from '../../hooks/useAnalytics'
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

export default function AnalyticsDashboard() {
  const { metrics, organizationGrowth, auditorTier, credentialStatus, applicationTrend, standards, advisorStats, reports, loading, error, refresh } = useAnalytics()

  if (error) return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-2xl text-center">
        <h3 className="text-lg font-semibold">Failed to load analytics</h3>
        <p className="text-sm text-slate-500">{error}</p>
        <button onClick={refresh} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Retry</button>
      </div>
    </div>
  )

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen">
      <AnalyticsHeader onRefresh={refresh} />
      <div className="mt-6 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <Filters />
          <div className="flex items-center gap-3">
            <ExportButton />
            <button onClick={refresh} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 transition">Refresh Data</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-[16px] border border-slate-200 animate-pulse" />
          ))}
          {metrics && metrics.map(m => (
            <MetricCard key={m.id} metric={m} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold">Organization Growth Over Time</h4>
              <button className="text-sm text-slate-500 hover:text-slate-700">Monthly</button>
            </div>
            {organizationGrowth && <VerticalBarChart data={organizationGrowth} />}
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-semibold">Auditor Tier Distribution</h4>
                <span className="text-sm text-slate-500">Updated: Jun 18, 2026</span>
              </div>
              {auditorTier && <PieChart data={auditorTier} inner={56} />}
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-semibold">Credential Status</h4>
                <span className="text-sm text-slate-500">Updated: Jun 18, 2026</span>
              </div>
              {credentialStatus && <PieChart data={credentialStatus} inner={56} />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold">Applications Trend</h4>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet-500" /> Submitted</span>
                <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-600" /> Approved</span>
              </div>
            </div>
            {applicationTrend && <AreaChart data={applicationTrend} />}
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-semibold">Top Standards by Adoption</h4>
                <span className="text-sm text-slate-500">Ranked</span>
              </div>
              {standards && <StandardsProgress data={standards} />}
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-semibold">Advisor Statistics</h4>
                <span className="text-sm text-slate-500">Key Profiles</span>
              </div>
              {advisorStats && <AdvisorDonutChart stats={advisorStats} />}
            </div>
          </div>
        </div>

        <ReportTable rows={reports || []} />
      </div>
    </div>
  )
}
