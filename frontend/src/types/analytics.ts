// ─── Original Main branch types (used by AnalyticsDashboard + old hook) ──────

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
  dateRange?: 'TODAY' | 'LAST_7_DAYS' | 'LAST_MONTH' | 'LAST_90_DAYS' | 'LAST_6_MONTHS' | 'LAST_YEAR' | 'CUSTOM'
  startDate?: string
  endDate?: string
  organizationId?: string
  standard?: string
  reportType?: string
  page?: number
  limit?: number
}

// ─── New types (used by new React Query hooks / new analytics components) ─────

export interface FilterQuery {
  startDate?: string
  endDate?: string
  reportType?: string
}

export interface AnalyticsOverview {
  totalOrganizations: number
  activeOrganizations: number
  suspendedOrganizations: number
  revokedOrganizations: number
  applications: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  credentials: number
  certificates: number
  trainingInstitutes: number
  auditors: number
  todaysActivity: number
  systemHealth: number
}

export interface ChartDataPoint {
  id?: string
  label?: string
  date?: string
  value: number
  x?: string
  y?: number
  [key: string]: any
}

export interface ChartDataResponse {
  monthlyApplications: ChartDataPoint[]
  monthlyCredentials: ChartDataPoint[]
  monthlyCertificates: ChartDataPoint[]
  organizationStatus: ChartDataPoint[]
  trainingInstitutes: ChartDataPoint[]
  countryDistribution: ChartDataPoint[]
  topStandards: ChartDataPoint[]
  auditTrend: ChartDataPoint[]
  auditorDistribution: ChartDataPoint[]
}

export interface RecentActivity {
  id: string
  type: 'AUDIT_LOG' | 'APPLICATION' | 'CREDENTIAL' | 'CERTIFICATE'
  title: string
  description: string
  timestamp: string
  status?: string
}

export interface RecentActivitiesResponse {
  activities: RecentActivity[]
}
