import React, { useMemo, useState } from 'react'
import type { ReportRow } from '../../../types/analytics'
import { analyticsApi } from '../../../services/api/analytics.api'
import { Download } from 'lucide-react'

function formatDetails(details: any): string {
  if (!details) return "—";
  if (typeof details === "string") {
    const trimmed = details.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        return formatDetails(parsed);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof details === "object") {
    const parts: string[] = [];
    if (details.reason) parts.push(`Reason: ${String(details.reason).trim()}`);
    if (details.status) parts.push(`Status: ${details.status}`);
    if (details.subject) parts.push(`Subject: "${details.subject}"`);
    if (details.recipient) parts.push(`Recipient: ${details.recipient}`);
    if (details.applicationStatus) parts.push(`App Status: ${details.applicationStatus}`);
    if (details.fullName) parts.push(`Name: ${details.fullName}`);
    if (details.company || details.organization) parts.push(`Org: ${details.company || details.organization}`);
    if (details.standard) parts.push(`Standard: ${details.standard}`);
    if (details.credentialId) parts.push(`Credential: ${details.credentialId}`);
    if (details.mappedTable) parts.push(`Mapped: ${details.mappedTable}`);
    if (details.insertedId) parts.push(`ID: ${details.insertedId}`);
    if (details.remarks) parts.push(`Remarks: ${details.remarks}`);

    if (parts.length > 0) return parts.join(" • ");

    const keys = Object.keys(details).filter((k) => details[k] !== null && details[k] !== undefined);
    if (keys.length > 0) {
      return keys.map((k) => `${k}: ${typeof details[k] === "object" ? JSON.stringify(details[k]) : details[k]}`).join(", ");
    }
  }
  return String(details);
}

function ActionBadge({ action }: { action: string }) {
  const color =
    action === 'Created'
      ? 'bg-green-100 text-green-800'
      : action === 'Revoked' || action === 'DELETE'
      ? 'bg-red-100 text-red-800'
      : 'bg-blue-100 text-blue-800'
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{action}</span>
}

export default function ReportTable({
  rows = [] as ReportRow[],
  queryParams,
}: {
  rows?: ReportRow[]
  queryParams?: Record<string, any>
}) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const per = 10

  const filtered = useMemo(() => {
    if (!q) return rows
    const s = q.toLowerCase()
    return rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(s)))
  }, [rows, q])

  const total = filtered.length
  const pages = Math.max(1, Math.ceil(total / per))
  const pageRows = filtered.slice((page - 1) * per, page * per)

  const downloadAuditLog = async (format: 'csv' | 'excel' | 'pdf') => {
    setExportLoading(true)
    try {
      const response = await analyticsApi.exportReport(format, queryParams)
      const blob = new Blob([response.data], {
        type: (response.headers['content-type'] as string | undefined) ?? 'application/octet-stream',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `audit-log.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Audit log export failed', err)
    } finally {
      setExportLoading(false)
      setExportOpen(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <p className="text-sm text-slate-500">Latest administrative actions and organization events.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            aria-label="Search logs"
            placeholder="Search logs..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
            className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
          />
          {/* Export Audit Log dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((s) => !s)}
              disabled={exportLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {exportLoading ? 'Exporting…' : 'Export Audit Log'}
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-20 py-1">
                <button
                  type="button"
                  onClick={() => downloadAuditLog('csv')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                >
                  CSV
                </button>
                <button
                  type="button"
                  onClick={() => downloadAuditLog('excel')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => downloadAuditLog('pdf')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                >
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Recent activity table">
          <thead className="bg-slate-50">
            <tr className="text-left text-slate-500 border-b border-slate-200">
              <th className="py-3 px-3 font-medium">Timestamp</th>
              <th className="py-3 px-3 font-medium">Admin</th>
              <th className="py-3 px-3 font-medium">Action</th>
              <th className="py-3 px-3 font-medium">Entity</th>
              <th className="py-3 px-3 font-medium">Details</th>
              <th className="py-3 px-3 font-medium">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                  No activity records found
                </td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{r.admin}</td>
                  <td className="py-3 px-3"><ActionBadge action={r.action} /></td>
                  <td className="py-3 px-3 text-slate-700">{r.entity}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium max-w-md leading-relaxed break-words">{formatDetails(r.details)}</td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{r.ip}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          {total === 0 ? 'No records' : `Showing ${(page - 1) * per + 1}–${Math.min(page * per, total)} of ${total}`}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
          >
            Prev
          </button>
          <span className="rounded-xl border border-slate-200 px-3 py-1 text-sm text-slate-700">
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="rounded-xl border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
