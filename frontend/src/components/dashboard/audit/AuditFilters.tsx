import React from 'react'
import { Calendar, Search } from 'lucide-react'
import type { AuditFilters as AuditFiltersType, AuditAction, AuditEntityType } from '../../../types/audit'
import ExportButtons from './ExportButtons'

const ACTION_OPTIONS: Array<{ label: string; value: AuditAction | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Created', value: 'CREATED' },
  { label: 'Updated', value: 'UPDATED' },
  { label: 'Deleted', value: 'DELETED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Revoked', value: 'REVOKED' },
  { label: 'Issued', value: 'ISSUED' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Login', value: 'LOGIN' },
  { label: 'Failed Login', value: 'FAILED_LOGIN' },
]

const ENTITY_OPTIONS: Array<{ label: string; value: AuditEntityType | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Organization', value: 'Organization' },
  { label: 'Auditor', value: 'Auditor' },
  { label: 'Credential', value: 'Credential' },
  { label: 'Application', value: 'Application' },
  { label: 'Advisory', value: 'Advisory' },
  { label: 'Content', value: 'Content' },
  { label: 'Settings', value: 'Settings' },
  { label: 'Authentication', value: 'Authentication' },
]

interface AuditFiltersProps {
  filters: AuditFiltersType
  onChange: (filters: AuditFiltersType) => void
  onExportCSV: () => void
  onExportPDF: () => void
  exportLoading?: boolean
}

export default function AuditFilters({
  filters,
  onChange,
  onExportCSV,
  onExportPDF,
  exportLoading,
}: AuditFiltersProps) {
  const update = (patch: Partial<AuditFiltersType>) => onChange({ ...filters, ...patch })

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      {/* Outer wrapper: single row on xl, wraps on smaller screens */}
      <div className="flex flex-wrap xl:flex-nowrap items-end gap-3">

        {/* Search – grows to fill available space, min usable width */}
        <div className="w-full sm:flex-1 sm:min-w-[160px]">
          <label className="block text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.search ?? ''}
              onChange={(e) => update({ search: e.target.value || undefined })}
              placeholder="Entity name, action, admin…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              aria-label="Search audit logs"
            />
          </div>
        </div>

        {/* Date Range – fixed min-width so both pickers always fit */}
        <div className="w-full sm:w-auto sm:min-w-[280px] shrink-0">
          <label className="block text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            Date range
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) => update({ dateFrom: e.target.value || undefined })}
                className="w-full pl-9 pr-2 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                aria-label="From date"
              />
            </div>
            <span className="text-slate-400 text-sm shrink-0">–</span>
            <div className="relative flex-1 min-w-0">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) => update({ dateTo: e.target.value || undefined })}
                className="w-full pl-9 pr-2 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                aria-label="To date"
              />
            </div>
          </div>
        </div>

        {/* Action Type – fixed width, never shrinks */}
        <div className="w-full sm:w-40 shrink-0">
          <label className="block text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            Action Type
          </label>
          <select
            value={filters.action ?? 'ALL'}
            onChange={(e) => update({ action: e.target.value as AuditAction | 'ALL' })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Entity – fixed width, never shrinks */}
        <div className="w-full sm:w-40 shrink-0">
          <label className="block text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            Entity
          </label>
          <select
            value={filters.entityType ?? 'ALL'}
            onChange={(e) => update({ entityType: e.target.value as AuditEntityType | 'ALL' })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          >
            {ENTITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Export – dropdown aligned with other filter controls */}
        <div className="w-full sm:w-auto shrink-0 sm:ml-auto">
          <label className="block text-[12px] font-medium text-slate-500 uppercase tracking-wide mb-1.5">
            Export
          </label>
          <ExportButtons
            onExportCSV={onExportCSV}
            onExportPDF={onExportPDF}
            loading={exportLoading}
          />
        </div>

      </div>
    </div>
  )
}
