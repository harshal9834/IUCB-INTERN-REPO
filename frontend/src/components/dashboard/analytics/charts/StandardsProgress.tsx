import React from 'react'

const COLORS = ['#0F3D91', '#2563EB', '#D4AF37', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export default function StandardsProgress({ data }: { data: { name: string; percent: number; color?: string }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border flex items-center justify-center" style={{ minHeight: 200 }}>
        <p className="text-sm text-slate-400">No standards data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-5 border space-y-4">
      {data.map((item, idx) => (
        <div key={item.name}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-slate-700">{item.name}</span>
            <span className="text-sm font-semibold text-slate-600">{item.percent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(item.percent, 100)}%`,
                backgroundColor: item.color || COLORS[idx % COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
