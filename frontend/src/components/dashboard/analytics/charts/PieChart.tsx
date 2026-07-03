import React from 'react'
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip } from 'recharts'

export default function PieChart({ data, inner = 70 }: { data: any[]; inner?: number }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0)
  return (
    <div className="bg-white rounded-2xl p-5 border flex flex-col">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Donut */}
        <div className="relative flex items-center justify-center" style={{ width: 200, height: 200, flexShrink: 0 }}>
          <ResponsiveContainer width={200} height={200}>
            <RePieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={inner}
                outerRadius={inner + 36}
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => [v, '']} />
            </RePieChart>
          </ResponsiveContainer>
          {/* Centre label — uses absolute inside a relative container, not the page */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900">{total}</span>
            <span className="text-xs text-slate-500">Total</span>
          </div>
        </div>
        {/* Legend */}
        <ul className="flex-1 space-y-2.5 min-w-0">
          {data.map((d, i) => {
            const pct = total ? Math.round((d.value / total) * 100) : 0
            return (
              <li key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ background: d.color || '#2563EB' }} />
                  <span className="text-sm text-slate-700 truncate">{d.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-600 shrink-0">{d.value} <span className="text-slate-400 font-normal">({pct}%)</span></span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
