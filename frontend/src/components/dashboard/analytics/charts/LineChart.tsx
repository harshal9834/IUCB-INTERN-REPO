import React from 'react'
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'

export default function LineChart({ data, dataKey = 'count', stroke = '#2563EB' }: { data: any[]; dataKey?: string; stroke?: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F1F5F9" />
          <XAxis dataKey="period" tick={{ fill: '#475569' }} />
          <YAxis tick={{ fill: '#475569' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={3} dot={{ r: 3 }} fill="url(#lineGradient)" />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  )
}
