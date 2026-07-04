import React from 'react'
import type { AuditAction } from '../../../types/audit'

const BADGE_STYLES: Record<string, string> = {
  CREATED: 'bg-green-100 text-green-700 border border-green-200',
  UPDATED: 'bg-blue-100 text-blue-700 border border-blue-200',
  DELETED: 'bg-red-100 text-red-700 border border-red-200',
  APPROVED: 'bg-teal-100 text-teal-700 border border-teal-200',
  REJECTED: 'bg-red-100 text-red-700 border border-red-200',
  REVOKED: 'bg-orange-100 text-orange-700 border border-orange-200',
  ISSUED: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  SUSPENDED: 'bg-amber-100 text-amber-700 border border-amber-200',
  ACTIVATED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  DEACTIVATED: 'bg-slate-100 text-slate-600 border border-slate-200',
  LOGIN: 'bg-sky-100 text-sky-700 border border-sky-200',
  LOGOUT: 'bg-slate-100 text-slate-600 border border-slate-200',
  FAILED_LOGIN: 'bg-red-100 text-red-700 border border-red-200',
  PASSWORD_RESET: 'bg-purple-100 text-purple-700 border border-purple-200',
  PUBLISHED: 'bg-green-100 text-green-700 border border-green-200',
  ARCHIVED: 'bg-slate-100 text-slate-600 border border-slate-200',
}

const BADGE_LABELS: Partial<Record<AuditAction, string>> = {
  FAILED_LOGIN: 'FAILED',
  PASSWORD_RESET: 'RESET',
}

export default function ActionBadge({ action }: { action: AuditAction }) {
  const style = BADGE_STYLES[action] ?? 'bg-slate-100 text-slate-600 border border-slate-200'
  const label = BADGE_LABELS[action] ?? action
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${style}`}
    >
      {label}
    </span>
  )
}
