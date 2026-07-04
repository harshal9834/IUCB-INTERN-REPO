import { useState, useCallback, useEffect, useRef } from 'react'
import type { AuditLog, AuditStatistics, AuditFilters, AuditPagination } from '../types/audit'
import { auditApi } from '../services/api/audit.api'

// ─── default state ────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: AuditFilters = {
  action: 'ALL',
  entityType: 'ALL',
}

const EMPTY_STATISTICS: AuditStatistics = {
  totalActions: 0,
  creates: 0,
  updates: 0,
  deletes: 0,
  statusChanges: 0,
}

const DEFAULT_PAGINATION: AuditPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export default function useAudit() {
  // ── state ──────────────────────────────────────────────────────────────────
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [statistics, setStatistics] = useState<AuditStatistics>(EMPTY_STATISTICS)
  const [pagination, setPagination] = useState<AuditPagination>(DEFAULT_PAGINATION)
  const [filters, setFilters] = useState<AuditFilters>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [selectedAudit, setSelectedAudit] = useState<AuditLog | null>(null)
  const [loading, setLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportLoading, setExportLoading] = useState(false)

  // ── debounce ref for search ─────────────────────────────────────────────────
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track whether we should skip the useEffect fetch (used when debouncing search)
  const skipFetchRef = useRef(false)

  // ── fetch logs from backend ─────────────────────────────────────────────────
  const fetchLogs = useCallback(
    async (currentFilters: AuditFilters, currentPage: number, currentLimit: number) => {
      setLoading(true)
      setError(null)
      try {
        const params: Record<string, string | number | undefined> = {
          page: currentPage,
          limit: currentLimit,
        }

        // Only send non-ALL values to keep the URL clean
        if (currentFilters.action && currentFilters.action !== 'ALL') {
          params.action = currentFilters.action
        }
        if (currentFilters.entityType && currentFilters.entityType !== 'ALL') {
          params.entityType = currentFilters.entityType
        }
        if (currentFilters.dateFrom) params.dateFrom = currentFilters.dateFrom
        if (currentFilters.dateTo)   params.dateTo   = currentFilters.dateTo
        if (currentFilters.search?.trim()) params.search = currentFilters.search.trim()

        const response = await auditApi.getAuditLogs(params as Parameters<typeof auditApi.getAuditLogs>[0])
        const { data } = response.data as {
          data: { logs: AuditLog[]; pagination: AuditPagination }
        }
        setLogs(data.logs)
        setPagination(data.pagination)
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed to load audit logs'
        setError(msg)
        setLogs([])
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // ── fetch statistics from backend ──────────────────────────────────────────
  const fetchStatistics = useCallback(async () => {
    setStatsLoading(true)
    try {
      const response = await auditApi.getAuditStatistics()
      const { data } = response.data as { data: AuditStatistics }
      setStatistics(data)
    } catch {
      // silently fall back to zeros – stats are non-critical
      setStatistics(EMPTY_STATISTICS)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // ── initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false
      return
    }
    fetchLogs(filters, page, limit)
  }, [filters, page, limit, fetchLogs])

  // ── filter helpers ──────────────────────────────────────────────────────────
  const applyFilters = useCallback(
    (f: AuditFilters) => {
      // Debounce only if the search string changed
      const searchChanged = f.search !== filters.search

      if (searchChanged && searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
      }

      if (searchChanged) {
        // Set the skip flag so the useEffect doesn't fire an immediate fetch
        skipFetchRef.current = true
        setFilters(f)
        setPage(1)
        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
        searchDebounceRef.current = setTimeout(() => {
          skipFetchRef.current = false
          fetchLogs(f, 1, limit)
        }, 400)
      } else {
        setFilters(f)
        setPage(1)
      }
    },
    [filters.search, limit, fetchLogs],
  )

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
  }, [])

  // ── drawer helpers ──────────────────────────────────────────────────────────
  const openDrawer = useCallback(async (log: AuditLog) => {
    // Optimistically show the row data immediately, then enrich with full detail
    setSelectedAudit(log)
    try {
      const response = await auditApi.getAuditLogById(log.id)
      const { data } = response.data as { data: AuditLog }
      setSelectedAudit(data)
    } catch {
      // keep the row data already shown – detail endpoint failure is non-fatal
    }
  }, [])

  const closeDrawer = useCallback(() => setSelectedAudit(null), [])

  // ── page / limit ────────────────────────────────────────────────────────────
  const handlePageChange = useCallback((p: number) => setPage(p), [])

  const handleLimitChange = useCallback((l: number) => {
    setLimit(l)
    setPage(1)
  }, [])

  // ── export helpers ──────────────────────────────────────────────────────────
  const buildExportParams = () => {
    const params: Record<string, string | undefined> = {}
    if (filters.action && filters.action !== 'ALL')       params.action     = filters.action
    if (filters.entityType && filters.entityType !== 'ALL') params.entityType = filters.entityType
    if (filters.dateFrom)  params.dateFrom = filters.dateFrom
    if (filters.dateTo)    params.dateTo   = filters.dateTo
    if (filters.search?.trim()) params.search = filters.search.trim()
    return params
  }

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportCSV = useCallback(async () => {
    setExportLoading(true)
    try {
      const params = buildExportParams() as Parameters<typeof auditApi.exportAuditCSV>[0]
      const response = await auditApi.exportAuditCSV(params)
      triggerDownload(new Blob([response.data as BlobPart], { type: 'text/csv' }), 'audit-log.csv')
    } catch {
      // do nothing – export failures are not critical
    } finally {
      setExportLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const exportPDF = useCallback(async () => {
    setExportLoading(true)
    try {
      const params = buildExportParams() as Parameters<typeof auditApi.exportAuditPDF>[0]
      const response = await auditApi.exportAuditPDF(params)
      triggerDownload(
        new Blob([response.data as BlobPart], { type: 'application/pdf' }),
        'audit-log.pdf',
      )
    } catch {
      // do nothing
    } finally {
      setExportLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  // ── return ──────────────────────────────────────────────────────────────────
  return {
    logs,
    statistics,
    loading: loading || statsLoading,
    error,
    filters,
    applyFilters,
    resetFilters,
    selectedAudit,
    openDrawer,
    closeDrawer,
    exportCSV,
    exportPDF,
    exportLoading,
    pagination,
    onPageChange: handlePageChange,
    onLimitChange: handleLimitChange,
  }
}
