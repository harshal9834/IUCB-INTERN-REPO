import React, { useEffect, useCallback, useState } from 'react'
import {
  X, Clock, Zap, Box, Tag, Hash, FileText, User, Shield,
  Globe, Monitor, Database, ChevronDown, ChevronRight, MessageSquare,
} from 'lucide-react'
import type { AuditLog } from '../../../types/audit'
import ActionBadge from './ActionBadge'

interface AuditDetailsDrawerProps {
  log: AuditLog | null
  onClose: () => void
}

function JsonViewer({ data, label }: { data: Record<string, unknown> | null | undefined; label: string }) {
  const [open, setOpen] = useState(false)
  if (!data) {
    return (
      <div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        <p className="text-xs text-slate-400 mt-1 italic">— No Data</p>
      </div>
    )
  }
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:text-[#1E3A5F] transition"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        {label}
      </button>
      {open && (
        <pre className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 overflow-x-auto whitespace-pre-wrap break-all">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="h-6 w-6 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-sm text-slate-700 break-words">{value}</div>
      </div>
    </div>
  )
}

export default function AuditDetailsDrawer({ log, onClose }: AuditDetailsDrawerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!log) return null

  const fmt = (ts: string) =>
    new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Audit Log Details"
        className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
        style={{ animation: 'slideInRight 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h2 className="text-base font-bold text-[#1E3A5F]">Audit Log Details</h2>
            <p className="text-xs text-slate-400 mt-0.5">Full record of this action</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
          <DetailRow
            icon={<Clock className="h-4 w-4" />}
            label="Timestamp"
            value={fmt(log.timestamp)}
          />
          <DetailRow
            icon={<Zap className="h-4 w-4" />}
            label="Action Type"
            value={<ActionBadge action={log.action} />}
          />
          <DetailRow
            icon={<Box className="h-4 w-4" />}
            label="Entity Type"
            value={log.entityType}
          />
          <DetailRow
            icon={<Tag className="h-4 w-4" />}
            label="Entity Name"
            value={log.entityName}
          />
          <DetailRow
            icon={<Hash className="h-4 w-4" />}
            label="Entity ID"
            value={<span className="font-mono text-xs">{log.entityId}</span>}
          />
          <DetailRow
            icon={<FileText className="h-4 w-4" />}
            label="Action"
            value={log.details}
          />
          <DetailRow
            icon={<User className="h-4 w-4" />}
            label="Admin"
            value={log.adminName}
          />
          <DetailRow
            icon={<Shield className="h-4 w-4" />}
            label="Admin ID"
            value={<span className="font-mono text-xs">{log.adminId}</span>}
          />
          <DetailRow
            icon={<Globe className="h-4 w-4" />}
            label="IP Address"
            value={log.ipAddress}
          />
          <DetailRow
            icon={<Monitor className="h-4 w-4" />}
            label="User Agent"
            value={<span className="text-xs leading-relaxed">{log.userAgent}</span>}
          />

          {/* Old / New Data */}
          <div className="pt-3 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <Database className="h-3.5 w-3.5" />
              Data Changes
            </div>
            <JsonViewer data={log.oldData} label="Old Data" />
            <JsonViewer data={log.newData} label="New Data" />
          </div>

          {/* Remarks */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              <MessageSquare className="h-3.5 w-3.5" />
              Remarks
            </div>
            <p className="text-sm text-slate-600">
              {log.remarks ?? <span className="text-slate-400 italic">—</span>}
            </p>
          </div>
        </div>
      </aside>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  )
}
