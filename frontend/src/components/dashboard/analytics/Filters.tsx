import React, { useState } from 'react'
import type { AnalyticsFilters, AnalyticsQueryParams } from '../../../types/analytics'

const dateOptions = [
  { label: 'Last 7 Days', value: 'LAST_7_DAYS' },
  { label: 'Last Month', value: 'LAST_MONTH' },
  { label: 'Last Year', value: 'LAST_YEAR' },
  { label: 'Custom', value: 'CUSTOM' },
]

const reportTypeOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Overview', value: 'OVERVIEW' },
  { label: 'Organizations', value: 'ORGANIZATIONS' },
  { label: 'Auditors', value: 'AUDITORS' },
  { label: 'Credentials', value: 'CREDENTIALS' },
  { label: 'Applications', value: 'APPLICATIONS' },
  { label: 'Advisors', value: 'ADVISORS' },
  { label: 'Resources', value: 'RESOURCES' },
  { label: 'Reports', value: 'REPORTS' },
  { label: 'Audit Logs', value: 'AUDIT_LOGS' },
]

export default function Filters({
  filters,
  values,
  onApply,
  onReset,
}: {
  filters?: AnalyticsFilters | null
  values?: AnalyticsQueryParams
  onApply?: (params: AnalyticsQueryParams) => void
  onReset?: () => void
}) {
  const [dateRange, setDateRange] = useState<'LAST_7_DAYS' | 'LAST_MONTH' | 'LAST_YEAR' | 'CUSTOM'>(
    values?.dateRange ?? 'LAST_7_DAYS',
  )
  const [reportType, setReportType] = useState(values?.reportType ?? 'ALL')

  const handleReset = () => {
    setDateRange('LAST_7_DAYS')
    setReportType('ALL')
    onReset?.()
  }

  const handleApply = () => {
    onApply?.({ dateRange, reportType })
  }

  return (
    <div className="bg-white rounded-[16px] border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        <div>
          <label className="block text-[13px] tracking-wide text-slate-500 mb-1">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as 'LAST_7_DAYS' | 'LAST_MONTH' | 'LAST_YEAR' | 'CUSTOM')}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:ring-blue-200 focus:border-blue-300 focus:outline-none"
          >
            {dateOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[13px] tracking-wide text-slate-500 mb-1">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:ring-blue-200 focus:border-blue-300 focus:outline-none"
          >
            {reportTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}
