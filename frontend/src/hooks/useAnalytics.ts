import { useEffect, useState, useCallback } from 'react'
import { analyticsApi } from '../services/api/analytics.api'
import type {
  AnalyticsFilters,
  AnalyticsQueryParams,
  AnalyticsDashboardData,
  Metric,
  OrganizationPoint,
  AuditorTier,
  CredentialStatusItem,
  ApplicationPoint,
  AdvisorStat,
  StandardAdoption,
  ReportRow,
} from '../types/analytics'

export default function useAnalytics() {
  const [metrics, setMetrics] = useState<Metric[] | null>(null)
  const [organizationGrowth, setOrganizationGrowth] = useState<OrganizationPoint[] | null>(null)
  const [auditorTier, setAuditorTier] = useState<AuditorTier[] | null>(null)
  const [credentialStatus, setCredentialStatus] = useState<CredentialStatusItem[] | null>(null)
  const [applicationTrend, setApplicationTrend] = useState<ApplicationPoint[] | null>(null)
  const [advisorStats, setAdvisorStats] = useState<AdvisorStat | null>(null)
  const [standards, setStandards] = useState<StandardAdoption[] | null>(null)
  const [reports, setReports] = useState<ReportRow[] | null>(null)
  const [filters, setFilters] = useState<AnalyticsFilters | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [queryParams, setQueryParams] = useState<AnalyticsQueryParams>({})

  const loadFilters = useCallback(async () => {
    try {
      const response = await analyticsApi.getFilters()
      setFilters(response.data.data)
    } catch (err: any) {
      console.error('Unable to fetch analytics filters', err)
    }
  }, [])

  const fetchDashboard = useCallback(async (params: AnalyticsQueryParams = {}) => {
    setLoading(true)
    setError(null)
    try {
      setQueryParams(params)
      const response = await analyticsApi.getDashboard(params)
      const data: AnalyticsDashboardData = response.data.data
      setMetrics(data.metrics)
      setOrganizationGrowth(data.organizationGrowth)
      setAuditorTier(data.auditorTier)
      setCredentialStatus(data.credentialStatus)
      setApplicationTrend(data.applicationTrend)
      setAdvisorStats(data.advisorStats)
      setStandards(data.standards)
      setReports(data.reports)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(() => fetchDashboard(queryParams), [fetchDashboard, queryParams])

  const applyFilters = useCallback(
    (params: AnalyticsQueryParams) => {
      fetchDashboard(params)
    },
    [fetchDashboard],
  )

  const resetFilters = useCallback(() => {
    setQueryParams({})
    fetchDashboard({})
  }, [fetchDashboard])

  useEffect(() => {
    loadFilters()
    fetchDashboard()
  }, [loadFilters, fetchDashboard])

  return {
    metrics,
    organizationGrowth,
    auditorTier,
    credentialStatus,
    applicationTrend,
    advisorStats,
    standards,
    reports,
    filters,
    loading,
    error,
    refresh,
    applyFilters,
    resetFilters,
    queryParams,
  }
}
