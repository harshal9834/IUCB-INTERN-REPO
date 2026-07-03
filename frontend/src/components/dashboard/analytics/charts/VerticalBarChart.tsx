import React from 'react'
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'

export default function VerticalBarChart({ data }: { data: any[] }) {
  const primary = '#2563EB'
  const gold = '#D4AF37'
  return (
    <div className="bg-white rounded-2xl p-5 border" style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="period" tick={{ fill: '#475569', fontSize: 12 }} />
          <YAxis tick={{ fill: '#475569', fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" barSize={32} radius={[8, 8, 0, 0]} animationDuration={800}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === data.length - 1 ? gold : primary} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}
