import React from 'react'
import useAudit from '../../../hooks/useAudit'
import AuditHeader from './AuditHeader'
import AuditFilters from './AuditFilters'
import AuditStats from './AuditStats'
import AuditTable from './AuditTable'
import Pagination from './Pagination'
import AuditDetailsDrawer from './AuditDetailsDrawer'

export default function AuditDashboard() {
  const {
    logs,
    statistics,
    loading,
    error,
    filters,
    applyFilters,
    selectedAudit,
    openDrawer,
    closeDrawer,
    exportCSV,
    exportPDF,
    exportLoading,
    pagination,
    onPageChange,
    onLimitChange,
  } = useAudit()

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <h3 className="text-base font-semibold text-slate-700">Failed to load audit logs</h3>
          <p className="text-sm text-slate-400 mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen space-y-6">
      {/* Page header */}
      <AuditHeader />

      {/* Filters + Export */}
      <AuditFilters
        filters={filters}
        onChange={applyFilters}
        onExportCSV={exportCSV}
        onExportPDF={exportPDF}
        exportLoading={exportLoading}
      />

      {/* Statistics Cards */}
      <AuditStats statistics={statistics} loading={loading} />

      {/* Table */}
      <div className="space-y-0">
        <AuditTable logs={logs} loading={loading} onView={openDrawer} />

        {/* Pagination */}
        {!loading && pagination.total > 0 && (
          <div className="bg-white border border-t-0 border-slate-200 rounded-b-2xl px-4">
            <Pagination
              pagination={pagination}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
            />
          </div>
        )}
      </div>

      {/* Details Drawer */}
      <AuditDetailsDrawer log={selectedAudit} onClose={closeDrawer} />
    </div>
  )
}
