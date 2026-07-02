import { useEffect, useState, useCallback } from 'react'
import { getDashboardMetrics, getCharts, getReports } from '../lib/analytics'
import type { Metric, OrganizationPoint, AuditorTier, CredentialStatusItem, ApplicationPoint, AdvisorStat, StandardAdoption, ReportRow } from '../types/analytics'

export default function useAnalytics() {
  const [metrics, setMetrics] = useState<Metric[] | null>(null)
  const [organizationGrowth, setOrganizationGrowth] = useState<OrganizationPoint[] | null>(null)
  const [auditorTier, setAuditorTier] = useState<AuditorTier[] | null>(null)
  const [credentialStatus, setCredentialStatus] = useState<CredentialStatusItem[] | null>(null)
  const [applicationTrend, setApplicationTrend] = useState<ApplicationPoint[] | null>(null)
  const [advisorStats, setAdvisorStats] = useState<AdvisorStat | null>(null)
  const [standards, setStandards] = useState<StandardAdoption[] | null>(null)
  const [reports, setReports] = useState<ReportRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [m, c, r] = await Promise.all([getDashboardMetrics(), getCharts(), getReports()])
      setMetrics(m)
      setOrganizationGrowth(c.organizationGrowth)
      setAuditorTier(c.auditorTier)
      setCredentialStatus(c.credentialStatus)
      setApplicationTrend(c.applicationTrend)
      setAdvisorStats(c.advisorStats)
      setStandards(c.standards)
      setReports(r)
    } catch (err: any) {
      setError(err?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    metrics,
    organizationGrowth,
    auditorTier,
    credentialStatus,
    applicationTrend,
    advisorStats,
    standards,
    reports,
    loading,
    error,
    refresh: fetchAll,
  }
}
