import React, { memo } from 'react'
import { Eye } from 'lucide-react'
import type { AuditLog } from '../../../types/audit'
import ActionBadge from './ActionBadge'

interface AuditRowProps {
  log: AuditLog
  index: number
  onView: (log: AuditLog) => void
}

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
      <td className="px-4 py-3 text-sm font-medium text-slate-700 max-w-md break-words leading-relaxed" title={formatDetails(log.details)}>
        {formatDetails(log.details)}
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
