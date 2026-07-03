import React from 'react'
import { ResponsiveContainer, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts'

export default function BarChart({ data, dataKey = 'percent' }: { data: any[]; dataKey?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart layout="vertical" data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#F1F5F9" vertical={false} />
          <XAxis type="number" tick={{ fill: '#475569' }} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#475569' }} width={160} />
          <Tooltip />
          <Bar dataKey={dataKey} radius={[8, 8, 8, 8]}>
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color || '#2563EB'} />
            ))}
          </Bar>
          {/* end labels */}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}
