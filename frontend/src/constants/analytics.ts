import { Metric, OrganizationPoint, AuditorTier, CredentialStatusItem, ApplicationPoint, AdvisorStat, StandardAdoption, ReportRow } from '../types/analytics'

export const metrics: Metric[] = [
  { id: 'orgs', title: 'Total Organizations', value: 254, delta: 12.5, trend: 'up' },
  { id: 'auditors', title: 'Active Auditors', value: 78, delta: 8.3, trend: 'up' },
  { id: 'credentials', title: 'Issued Credentials', value: 1290, delta: 15.7, trend: 'up' },
  { id: 'pending', title: 'Pending Applications', value: 23, delta: -4.2, trend: 'down' },
  { id: 'advisors', title: 'Approved Advisors', value: 42, delta: 6.1, trend: 'up' },
  { id: 'resources', title: 'Total Resources', value: 98, delta: 9.4, trend: 'up' },
]

export const organizationGrowth: OrganizationPoint[] = [
  { period: 'Jan 2026', count: 12 },
  { period: 'Feb 2026', count: 15 },
  { period: 'Mar 2026', count: 18 },
  { period: 'Apr 2026', count: 22 },
  { period: 'May 2026', count: 25 },
  { period: 'Jun 2026', count: 28 },
]

export const auditorTier: AuditorTier[] = [
  { name: 'Lead Auditors', value: 18, color: '#0F3D91' },
  { name: 'Senior Auditors', value: 15, color: '#2563EB' },
  { name: 'Associates', value: 12, color: '#D4AF37' },
  { name: 'Trainees', value: 8, color: '#10B981' },
  { name: 'Others', value: 25, color: '#6B7280' },
]

export const credentialStatus: CredentialStatusItem[] = [
  { name: 'Active', value: 1006, color: '#10B981' },
  { name: 'Suspended', value: 180, color: '#F59E0B' },
  { name: 'Revoked', value: 104, color: '#DC2626' },
]

export const applicationTrend: ApplicationPoint[] = [
  { period: 'Jan 2026', submitted: 45, approved: 30 },
  { period: 'Feb 2026', submitted: 52, approved: 35 },
  { period: 'Mar 2026', submitted: 65, approved: 40 },
  { period: 'Apr 2026', submitted: 70, approved: 48 },
  { period: 'May 2026', submitted: 68, approved: 50 },
  { period: 'Jun 2026', submitted: 75, approved: 60 },
]

export const advisorStats: AdvisorStat = {
  total: 42,
  licensed: 28,
  pending: 8,
  inactive: 6,
}

export const standards: StandardAdoption[] = [
  { name: 'ISO 27001', percent: 85, color: '#0F3D91' },
  { name: 'ISO 9001', percent: 62, color: '#2563EB' },
  { name: 'ISO 27701', percent: 45, color: '#D4AF37' },
  { name: 'SOC 2', percent: 38, color: '#10B981' },
  { name: 'GDPR', percent: 22, color: '#6B7280' },
]

export const reports: ReportRow[] = [
  {
    id: 'r1',
    timestamp: 'Jun 18, 2026 09:58 AM',
    admin: 'Admin User',
    action: 'Updated',
    entity: 'Organization',
    details: 'Updated organization profile for Global Tech Solutions (ID: ORG-1024)',
    ip: '192.168.1.10',
  },
  {
    id: 'r2',
    timestamp: 'Jun 18, 2026 09:42 AM',
    admin: 'Admin User',
    action: 'Created',
    entity: 'Auditor',
    details: 'Created new auditor account for Jane Smith (ID: AUD-2048)',
    ip: '192.168.1.11',
  },
  {
    id: 'r3',
    timestamp: 'Jun 18, 2026 09:15 AM',
    admin: 'Admin User',
    action: 'Issued',
    entity: 'Credential',
    details: 'Issued credential CERT-88321 to John Doe (AUD-1015)',
    ip: '192.168.1.12',
  },
  {
    id: 'r4',
    timestamp: 'Jun 17, 2026 04:33 PM',
    admin: 'Admin User',
    action: 'Updated',
    entity: 'Application',
    details: 'Updated application APP-7752 status to Under Review',
    ip: '192.168.1.13',
  },
  {
    id: 'r5',
    timestamp: 'Jun 17, 2026 03:12 PM',
    admin: 'Admin User',
    action: 'Revoked',
    entity: 'Credential',
    details: 'Revoked credential CERT-7712 from Mark Lee (AUD-0987)',
    ip: '192.168.1.14',
  },
]

export default {
  metrics,
  organizationGrowth,
  auditorTier,
  credentialStatus,
  applicationTrend,
  advisorStats,
  standards,
  reports,
}
