import React, { useState } from 'react'
import type { AnalyticsFilters, AnalyticsQueryParams } from '../../../types/analytics'

const dateOptions = [
  { label: 'Today', value: 'TODAY' },
  { label: 'Last 7 Days', value: 'LAST_7_DAYS' },
  { label: 'Last 30 Days', value: 'LAST_MONTH' },
  { label: 'Last 90 Days', value: 'LAST_90_DAYS' },
  { label: 'Last 6 Months', value: 'LAST_6_MONTHS' },
  { label: 'Last Year', value: 'LAST_YEAR' },
  { label: 'Custom Range', value: 'CUSTOM' },
]

const reportTypeOptions = [
  { label: 'Overview (All)', value: 'ALL' },
  { label: 'Organizations', value: 'ORGANIZATIONS' },
  { label: 'Applications', value: 'APPLICATIONS' },
  { label: 'Credentials', value: 'CREDENTIALS' },
  { label: 'Auditors', value: 'AUDITORS' },
  { label: 'Advisory Board', value: 'ADVISORS' },
  { label: 'Training Institutes', value: 'TRAINING_INSTITUTES' },
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
  const [dateRange, setDateRange] = useState<string>(values?.dateRange ?? 'LAST_7_DAYS')
  const [reportType, setReportType] = useState(values?.reportType ?? 'ALL')
  const [startDate, setStartDate] = useState(values?.startDate ?? '')
  const [endDate, setEndDate] = useState(values?.endDate ?? '')

  const handleReset = () => {
    setDateRange('LAST_7_DAYS')
    setReportType('ALL')
    setStartDate('')
    setEndDate('')
    onReset?.()
  }

  const handleApply = () => {
    const params: AnalyticsQueryParams = {
      dateRange: dateRange as AnalyticsQueryParams['dateRange'],
      reportType,
    }
    if (dateRange === 'CUSTOM') {
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate
    }
    onApply?.(params)
  }

  return (
    <div className="bg-white rounded-[16px] border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-end gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        {/* Date Range */}
        <div>
          <label className="block text-[13px] tracking-wide text-slate-500 mb-1">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:ring-blue-200 focus:border-blue-300 focus:outline-none"
          >
            {dateOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[13px] tracking-wide text-slate-500 mb-1">Category</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:ring-blue-200 focus:border-blue-300 focus:outline-none"
          >
            {reportTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Custom date pickers — shown only when CUSTOM is selected */}
        {dateRange === 'CUSTOM' && (
          <>
            <div>
              <label className="block text-[13px] tracking-wide text-slate-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:ring-blue-200 focus:border-blue-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] tracking-wide text-slate-500 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm focus:ring-blue-200 focus:border-blue-300 focus:outline-none"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100 transition"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  )
}
