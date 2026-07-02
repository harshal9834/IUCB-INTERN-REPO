import React from 'react'

export default function Filters({ onApply, onReset }: { onApply?: () => void; onReset?: () => void }) {
  return (
    <div className="bg-white rounded-[16px] border border-slate-200 p-4 flex flex-col xl:flex-row xl:items-center gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 flex-1">
        <div>
          <label className="block text-[13px] tracking-wide text-slate-500 mb-1">Date Range</label>
          <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:ring-blue-200 focus:border-blue-300 focus:outline-none">
            <option>Last 7 Days</option>
            <option>Last Month</option>
            <option>Last Year</option>
            <option>Custom</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] tracking-wide text-slate-500 mb-1">Report Type</label>
          <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:ring-blue-200 focus:border-blue-300 focus:outline-none">
            <option>All</option>
            <option>Overview</option>
            <option>Organizations</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] tracking-wide text-slate-500 mb-1">Organization</label>
          <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:ring-blue-200 focus:border-blue-300 focus:outline-none">
            <option>All Organizations</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] tracking-wide text-slate-500 mb-1">Standard</label>
          <select className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:ring-blue-200 focus:border-blue-300 focus:outline-none">
            <option>All Standards</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <button onClick={onReset} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition">Reset</button>
        <button onClick={onApply} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition">Apply Filters</button>
      </div>
    </div>
  )
}
