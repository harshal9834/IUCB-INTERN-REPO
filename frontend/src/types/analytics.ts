export type Trend = 'up' | 'down'

export interface Metric {
  id: string
  title: string
  value: number
  delta: number
  trend: Trend
}

export interface OrganizationPoint {
  period: string
  count: number
}

export interface AuditorTier {
  name: string
  value: number
  color?: string
}

export interface CredentialStatusItem {
  name: string
  value: number
  color?: string
}

export interface ApplicationPoint {
  period: string
  submitted: number
  approved: number
}

export interface AdvisorStat {
  total: number
  licensed: number
  pending: number
  inactive: number
}

export interface StandardAdoption {
  name: string
  percent: number
  color?: string
}

export interface ReportRow {
  id: string
  timestamp: string
  admin: string
  action: string
  entity: string
  details: string
  ip: string
}

export interface AnalyticsDashboardData {
  metrics: Metric[]
  organizationGrowth: OrganizationPoint[]
  auditorTier: AuditorTier[]
  credentialStatus: CredentialStatusItem[]
  applicationTrend: ApplicationPoint[]
  advisorStats: AdvisorStat
  standards: StandardAdoption[]
  reports: ReportRow[]
}

export interface AnalyticsFilters {
  organizations: Array<{ id: string; name: string }>
  standards: string[]
  reportTypes: string[]
}

export interface AnalyticsQueryParams {
  dateRange?: "LAST_7_DAYS" | "LAST_MONTH" | "LAST_YEAR" | "CUSTOM"
  startDate?: string
  endDate?: string
  organizationId?: string
  standard?: string
  reportType?: string
  page?: number
  limit?: number
}
