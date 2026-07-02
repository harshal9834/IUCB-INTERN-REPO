import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import type { AdvisorStat } from '../../../types/analytics'

const breakdown = [
  { name: 'Licensed', valueKey: 'licensed', color: '#0F3D91' },
  { name: 'Pending', valueKey: 'pending', color: '#2563EB' },
  { name: 'Inactive', valueKey: 'inactive', color: '#10B981' },
]

export default function AdvisorDonutChart({ stats }: { stats: AdvisorStat }) {
  const data = breakdown.map(item => ({ name: item.name, value: stats[item.valueKey as keyof AdvisorStat] as number, color: item.color }))
  const total = data.reduce((sum, entry) => sum + entry.value, 0)

  return (
    <div className="bg-white rounded-2xl p-4 border h-64 flex items-center">
      <div className="flex-1 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={4}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value}`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute text-center">
          <div className="text-3xl font-semibold text-slate-900">{total}</div>
          <div className="text-sm text-slate-500">Total Advisors</div>
        </div>
      </div>
      <div className="w-40 pl-4">
        <ul className="space-y-3">
          {data.map((item) => (
            <li key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-700">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
