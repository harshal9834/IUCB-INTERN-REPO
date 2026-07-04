import React, { memo } from 'react'
import { ClipboardList, Plus, Pencil, Trash2, ArrowLeftRight } from 'lucide-react'
import type { AuditStatistics } from '../../../types/audit'

interface StatCard {
  label: string
  value: number
  sub: string
  icon: React.ReactNode
  iconBg: string
  accent: string
}

function StatCard({ label, value, sub, icon, iconBg, accent }: StatCard) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`h-14 w-14 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className={`text-3xl font-bold ${accent}`}>{value.toLocaleString()}</div>
        <div className="text-sm font-semibold text-slate-700 mt-0.5">{label}</div>
        <div className="text-xs text-slate-400">{sub}</div>
      </div>
    </div>
  )
}

interface AuditStatsProps {
  statistics: AuditStatistics
  loading?: boolean
}

export default memo(function AuditStats({ statistics, loading }: AuditStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
        ))}
      </div>
    )
  }

  const cards: StatCard[] = [
    {
      label: 'Total Actions',
      value: statistics.totalActions,
      sub: 'this month',
      icon: <ClipboardList className="h-6 w-6 text-white" />,
      iconBg: 'bg-[#1E3A5F]',
      accent: 'text-[#1E3A5F]',
    },
    {
      label: 'Creates',
      value: statistics.creates,
      sub: 'new records',
      icon: <Plus className="h-6 w-6 text-white" />,
      iconBg: 'bg-emerald-500',
      accent: 'text-emerald-600',
    },
    {
      label: 'Updates',
      value: statistics.updates,
      sub: 'modifications',
      icon: <Pencil className="h-6 w-6 text-white" />,
      iconBg: 'bg-blue-500',
      accent: 'text-blue-600',
    },
    {
      label: 'Deletes',
      value: statistics.deletes,
      sub: 'removed records',
      icon: <Trash2 className="h-6 w-6 text-white" />,
      iconBg: 'bg-red-500',
      accent: 'text-red-600',
    },
    {
      label: 'Status Changes',
      value: statistics.statusChanges,
      sub: 'state transitions',
      icon: <ArrowLeftRight className="h-6 w-6 text-white" />,
      iconBg: 'bg-orange-500',
      accent: 'text-orange-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
})
