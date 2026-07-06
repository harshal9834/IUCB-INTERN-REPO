export interface FilterQuery {
  startDate?: string;
  endDate?: string;
  reportType?: string;
}

export interface AnalyticsOverview {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  revokedOrganizations: number;
  applications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  credentials: number;
  certificates: number;
  trainingInstitutes: number;
  auditors: number;
  todaysActivity: number;
  systemHealth: number;
}

export interface ChartDataPoint {
  id?: string;
  label?: string;
  date?: string;
  value: number;
  [key: string]: any;
}

export interface ChartDataResponse {
  monthlyApplications: ChartDataPoint[];
  monthlyCredentials: ChartDataPoint[];
  monthlyCertificates: ChartDataPoint[];
  organizationStatus: ChartDataPoint[];
  trainingInstitutes: ChartDataPoint[];
  countryDistribution: ChartDataPoint[];
  topStandards: ChartDataPoint[];
  auditTrend: ChartDataPoint[];
  auditorDistribution: ChartDataPoint[];
}

export interface RecentActivity {
  id: string;
  type: 'AUDIT_LOG' | 'APPLICATION' | 'CREDENTIAL' | 'CERTIFICATE';
  title: string;
  description: string;
  timestamp: Date;
  status?: string;
}

export interface RecentActivitiesResponse {
  activities: RecentActivity[];
}
