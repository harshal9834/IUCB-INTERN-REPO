import React, { memo } from 'react'
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AuditPagination } from '../../../types/audit'

interface PaginationProps {
  pagination: AuditPagination
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

const LIMIT_OPTIONS = [5, 10, 20, 50]

export default memo(function Pagination({ pagination, onPageChange, onLimitChange }: PaginationProps) {
  const { page, totalPages, total, limit } = pagination
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  const btnBase = 'h-8 w-8 flex items-center justify-center rounded-lg text-sm border transition'
  const btnActive = 'bg-[#1E3A5F] text-white border-[#1E3A5F] font-semibold'
  const btnNormal = 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
  const btnDisabled = 'bg-white text-slate-300 border-slate-200 cursor-not-allowed'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 py-3">
      <div className="text-sm text-slate-500">
        Showing {total === 0 ? 0 : start}–{end} of {total} results
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className={`${btnBase} ${page === 1 ? btnDisabled : btnNormal}`}
          aria-label="First page"
        >
          <ChevronFirst className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={`${btnBase} ${page === 1 ? btnDisabled : btnNormal}`}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} className="h-8 w-6 flex items-center justify-center text-slate-400 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`${btnBase} ${p === page ? btnActive : btnNormal}`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={`${btnBase} ${page === totalPages ? btnDisabled : btnNormal}`}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className={`${btnBase} ${page === totalPages ? btnDisabled : btnNormal}`}
          aria-label="Last page"
        >
          <ChevronLast className="h-4 w-4" />
        </button>

        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="ml-2 px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
          aria-label="Rows per page"
        >
          {LIMIT_OPTIONS.map((l) => (
            <option key={l} value={l}>{l} / page</option>
          ))}
        </select>
      </div>
    </div>
  )
})
