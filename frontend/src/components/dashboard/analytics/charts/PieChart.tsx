import React from 'react'
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip, Sector } from 'recharts'

export default function PieChart({ data, inner = 60 }: { data: any[]; inner?: number }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0)
  return (
    <div className="bg-white rounded-2xl p-4 border h-64 flex">
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={180}>
          <RePieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={inner} outerRadius={80} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
              ))}
            </Pie>
            <Tooltip />
          </RePieChart>
        </ResponsiveContainer>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-2xl font-semibold">{total}</div>
          <div className="text-xs text-slate-500">Total</div>
        </div>
      </div>
      <div className="w-40 pl-4">
        <ul className="space-y-2">
          {data.map((d, i) => {
            const pct = total ? Math.round((d.value / total) * 100) : 0
            return (
              <li key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-sm text-slate-700">{d.name}</span>
                </div>
                <div className="text-sm text-slate-500">{d.value} ({pct}%)</div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
