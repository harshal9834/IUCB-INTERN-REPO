import React from 'react'
import {
  ResponsiveContainer,
  AreaChart as ReAreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'

export default function AreaChart({ data }: { data: any[] }) {
  return (
    <div className="bg-white rounded-2xl p-5 border" style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReAreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F1F5F9" />
          <XAxis dataKey="period" tick={{ fill: '#475569', fontSize: 12 }} />
          <YAxis tick={{ fill: '#475569', fontSize: 12 }} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="submitted" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSubmitted)" />
          <Area type="monotone" dataKey="approved" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApproved)" />
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
