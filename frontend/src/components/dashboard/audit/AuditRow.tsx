import React, { memo } from 'react'
import { Eye } from 'lucide-react'
import type { AuditLog } from '../../../types/audit'
import ActionBadge from './ActionBadge'

interface AuditRowProps {
  log: AuditLog
  index: number
  onView: (log: AuditLog) => void
}

export default memo(function AuditRow({ log, index, onView }: AuditRowProps) {
  const ts = new Date(log.timestamp).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <tr
      className={`border-t border-slate-100 hover:bg-blue-50/40 transition-colors cursor-default ${
        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
      }`}
    >
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{ts}</td>
      <td className="px-4 py-3">
        <ActionBadge action={log.action} />
      </td>
      <td className="px-4 py-3 text-sm text-slate-700">{log.entityType}</td>
      <td className="px-4 py-3 text-sm font-medium text-slate-800">{log.entityName}</td>
      <td className="px-4 py-3 text-sm text-slate-500 max-w-[220px] truncate" title={log.details}>
        {log.details}
      </td>
      <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap font-mono">{log.ipAddress}</td>
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onView(log)}
          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-[#1E3A5F] hover:bg-blue-50 transition"
          aria-label={`View details for ${log.entityName}`}
        >
          <Eye className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
})
