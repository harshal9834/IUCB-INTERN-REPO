import data from '../constants/analytics'
import {
  Metric,
  OrganizationPoint,
  AuditorTier,
  CredentialStatusItem,
  ApplicationPoint,
  AdvisorStat,
  StandardAdoption,
  ReportRow,
} from '../types/analytics'

export function getDashboardMetrics(): Promise<Metric[]> {
  return Promise.resolve(data.metrics as Metric[])
}

export function getCharts(): Promise<{
  organizationGrowth: OrganizationPoint[]
  auditorTier: AuditorTier[]
  credentialStatus: CredentialStatusItem[]
  applicationTrend: ApplicationPoint[]
  advisorStats: AdvisorStat
  standards: StandardAdoption[]
}> {
  return Promise.resolve({
    organizationGrowth: data.organizationGrowth,
    auditorTier: data.auditorTier,
    credentialStatus: data.credentialStatus,
    applicationTrend: data.applicationTrend,
    advisorStats: data.advisorStats,
    standards: data.standards,
  })
}

export function getReports(): Promise<ReportRow[]> {
  return Promise.resolve(data.reports as ReportRow[])
}
