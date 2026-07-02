import React, { useMemo, useState } from 'react'
import type { ReportRow } from '../../types/analytics'

function ActionBadge({ action }: { action: string }) {
  const color = action === 'Created' ? 'bg-green-100 text-green-800' : action === 'Revoked' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{action}</span>
}

export default function ReportTable({ rows = [] as ReportRow[] }: { rows?: ReportRow[] }) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const per = 5

  const filtered = useMemo(() => {
    if (!q) return rows
    const s = q.toLowerCase()
    return rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(s)))
  }, [rows, q])

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / per))
  const pageRows = filtered.slice((page - 1) * per, page * per)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm text-slate-500">Latest administrative actions and organization events.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input aria-label="Search logs" placeholder="Search" value={q} onChange={e => { setQ(e.target.value); setPage(1) }} className="w-full sm:w-72 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700" />
          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">View Full Log</button>
          <button className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">Export Audit Log</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Recent activity table">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="py-3 pr-4">Timestamp</th>
              <th className="py-3 pr-4">Admin</th>
              <th className="py-3 pr-4">Action</th>
              <th className="py-3 pr-4">Entity</th>
              <th className="py-3 pr-4">Details</th>
              <th className="py-3 pr-4">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map(r => (
              <tr key={r.id} className="border-t border-slate-200 hover:bg-slate-50">
                <td className="py-3 pr-4 text-slate-700">{r.timestamp}</td>
                <td className="py-3 pr-4 text-slate-700">{r.admin}</td>
                <td className="py-3 pr-4"><ActionBadge action={r.action} /></td>
                <td className="py-3 pr-4 text-slate-700">{r.entity}</td>
                <td className="py-3 pr-4 text-slate-600">{r.details}</td>
                <td className="py-3 pr-4 text-slate-600">{r.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">Showing {(page - 1) * per + 1} - {Math.min(page * per, total)} of {total}</div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-xl border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 transition">Prev</button>
          <div className="rounded-xl border border-slate-200 px-3 py-1 text-sm text-slate-700">{page} / {pages}</div>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} className="rounded-xl border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 transition">Next</button>
        </div>
      </div>
    </div>
  )
}
