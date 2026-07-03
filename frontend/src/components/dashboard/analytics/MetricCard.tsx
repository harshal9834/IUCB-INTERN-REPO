import React from 'react'
import { User, FileText, Users, Clipboard } from 'lucide-react'
import type { Metric } from '../../../types/analytics'

const iconMap: Record<string, React.ReactNode> = {
  orgs: <Users className="text-2xl" />,
  auditors: <User className="text-2xl" />,
  credentials: <Clipboard className="text-2xl" />,
  pending: <FileText className="text-2xl" />,
  advisors: <Users className="text-2xl" />,
  resources: <FileText className="text-2xl" />,
}

export default function MetricCard({ metric }: { metric: Metric }) {
  const isUp = metric.trend === 'up'
  return (
    <div
      role="group"
      className="bg-white rounded-[16px] shadow-sm border border-gray-100 p-4 flex items-center space-x-4 hover:shadow-md transition-shadow transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-200"
      tabIndex={0}
      aria-label={`${metric.title}: ${metric.value}`}
    >
      <div className="w-14 h-14 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        {iconMap[metric.id] || <FileText />}
      </div>
      <div className="flex-1">
        <div className="text-2xl md:text-3xl font-semibold text-slate-900">{metric.value.toLocaleString()}</div>
        <div className="text-sm text-slate-500 flex items-center space-x-3 mt-1">
          <span className="font-medium">{metric.title}</span>
          <span className={`ml-2 text-sm ${isUp ? 'text-green-600' : 'text-rose-600'} font-semibold`}>
            {isUp ? `▲ ${Math.abs(metric.delta)}%` : `▼ ${Math.abs(metric.delta)}%`}
          </span>
        </div>
      </div>
    </div>
  )
}
