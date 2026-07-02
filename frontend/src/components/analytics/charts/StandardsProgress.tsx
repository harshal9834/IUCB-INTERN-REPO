import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  Cell,
} from 'recharts'

export default function StandardsProgress({ data }: { data: { name: string; percent: number; color?: string }[] }) {
  return (
    <div className="bg-white rounded-2xl p-4 border h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
          <CartesianGrid stroke="#F1F5F9" vertical={false} />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" width={160} tick={{ fill: '#475569', fontSize: 13 }} />
          <Tooltip formatter={(v: number) => `${v}%`} />
          <Bar dataKey="percent" barSize={14} radius={[8, 8, 8, 8]}>
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={entry.color || '#2563EB'} />
            ))}
            <LabelList dataKey="percent" position="right" formatter={(v: any) => `${v}%`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
