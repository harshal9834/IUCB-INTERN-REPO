import React from 'react'
import { RefreshCw } from 'lucide-react'

export default function AnalyticsHeader({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="text-sm text-slate-500">Analytics / Reports</div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Analytics & Reports</h1>
        <p className="text-sm text-slate-500">Periodic platform analytics and reporting insights.</p>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-3 py-2 bg-white border rounded-md shadow-sm hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <RefreshCw className="mr-2" /> Refresh Data
        </button>
      </div>
    </div>
  )
}
