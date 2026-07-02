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
