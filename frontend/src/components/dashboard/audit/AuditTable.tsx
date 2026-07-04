import React, { memo } from 'react'
import { ArrowUpDown } from 'lucide-react'
import type { AuditLog } from '../../../types/audit'
import AuditRow from './AuditRow'
import EmptyState from './EmptyState'
import LoadingSkeleton from './LoadingSkeleton'

const COLUMNS = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'action', label: 'Action Type' },
  { key: 'entityType', label: 'Entity Type' },
  { key: 'entityName', label: 'Entity Name' },
  { key: 'details', label: 'Details' },
  { key: 'ipAddress', label: 'IP Address' },
  { key: 'view', label: 'View', noSort: true },
]

interface AuditTableProps {
  logs: AuditLog[]
  loading: boolean
  onView: (log: AuditLog) => void
}

export default memo(function AuditTable({ logs, loading, onView }: AuditTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" aria-label="Audit log table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {!col.noSort && (
                      <ArrowUpDown className="h-3 w-3 text-slate-300" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <LoadingSkeleton rows={8} />
            ) : logs.length === 0 ? (
              <EmptyState />
            ) : (
              logs.map((log, i) => (
                <AuditRow key={log.id} log={log} index={i} onView={onView} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
})
