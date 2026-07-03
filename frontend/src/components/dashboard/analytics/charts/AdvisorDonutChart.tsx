import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { AdvisorStat } from '../../../../types/analytics'

const breakdown = [
  { name: 'Licensed', valueKey: 'licensed', color: '#0F3D91' },
  { name: 'Pending', valueKey: 'pending', color: '#D4AF37' },
  { name: 'Inactive', valueKey: 'inactive', color: '#10B981' },
]

export default function AdvisorDonutChart({ stats }: { stats: AdvisorStat }) {
  const data = breakdown.map(item => ({
    name: item.name,
    value: stats[item.valueKey as keyof AdvisorStat] as number,
    color: item.color,
  }))
  const total = data.reduce((sum, entry) => sum + entry.value, 0)

  return (
    <div className="bg-white rounded-2xl p-5 border flex flex-col sm:flex-row items-center gap-4">
      {/* Donut with centre label inside a relative container */}
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200, flexShrink: 0 }}>
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={68}
              outerRadius={90}
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [value, '']} />
          </PieChart>
        </ResponsiveContainer>
        {/* Centre label — inside relative wrapper, not floating on page */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">Total</span>
        </div>
      </div>
      {/* Legend */}
      <ul className="flex-1 space-y-3">
        {data.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-slate-700">{item.name}</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
