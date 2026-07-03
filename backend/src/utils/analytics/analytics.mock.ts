export interface AnalyticsOrganization {
  id: string;
  name: string;
  country: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "EXPIRED";
  createdAt: string;
}

export interface AnalyticsAuditor {
  id: string;
  fullName: string;
  tier: "ASSOCIATE" | "SENIOR" | "LEAD";
  status: "ACTIVE" | "INACTIVE";
  region: string;
  organizationId: string;
  createdAt: string;
}

export interface AnalyticsCredential {
  id: string;
  credentialNumber: string;
  standard: string;
  status: "VALID" | "SUSPENDED" | "REVOKED";
  issueDate: string;
  organizationId: string;
}

export interface AnalyticsApplication {
  id: string;
  applicantName: string;
  status: "SUBMITTED" | "APPROVED" | "REJECTED" | "PENDING";
  submittedAt: string;
  organizationId: string;
  standard: string;
}

export interface AnalyticsAdvisor {
  id: string;
  fullName: string;
  status: "APPROVED" | "PENDING" | "INACTIVE";
  expertiseArea: string;
  organizationId: string;
  approvedAt?: string;
}

export interface AnalyticsReportMetadata {
  reportId: string;
  reportType: string;
  generatedOn: string;
  generatedBy: string;
  totalRecords: number;
  organization?: string;
  standard?: string;
}

export interface AnalyticsAuditLogEntry {
  timestamp: string;
  admin: string;
  action: string;
  entity: string;
  details: string;
  ipAddress: string;
}

export interface AnalyticsResource {
  id: string;
  title: string;
  category: string;
  createdAt: string;
}

export const analyticsMock = {
  organizations: [
    {
      id: "org_001",
      name: "Global Standards Registrar",
      country: "United States",
      status: "ACTIVE",
      createdAt: "2025-01-12T08:30:00.000Z",
    },
    {
      id: "org_002",
      name: "EuroCert Compliance BV",
      country: "Netherlands",
      status: "ACTIVE",
      createdAt: "2025-03-23T10:15:00.000Z",
    },
    {
      id: "org_003",
      name: "APAC Quality Assurance Ltd",
      country: "Singapore",
      status: "PENDING",
      createdAt: "2025-05-05T11:45:00.000Z",
    },
    {
      id: "org_004",
      name: "Americas ISO Registrar",
      country: "Canada",
      status: "SUSPENDED",
      createdAt: "2025-08-16T09:20:00.000Z",
    },
    {
      id: "org_005",
      name: "CyberAccredit Audit Corp",
      country: "United Kingdom",
      status: "EXPIRED",
      createdAt: "2025-11-01T14:10:00.000Z",
    },
  ] as AnalyticsOrganization[],
  auditors: [
    {
      id: "aud_001",
      fullName: "Nina Patel",
      tier: "SENIOR",
      status: "ACTIVE",
      region: "North America",
      organizationId: "org_001",
      createdAt: "2025-02-02T08:00:00.000Z",
    },
    {
      id: "aud_002",
      fullName: "Lukas van Dijk",
      tier: "LEAD",
      status: "ACTIVE",
      region: "Europe",
      organizationId: "org_002",
      createdAt: "2025-04-12T09:30:00.000Z",
    },
    {
      id: "aud_003",
      fullName: "Ming Li",
      tier: "ASSOCIATE",
      status: "ACTIVE",
      region: "Asia Pacific",
      organizationId: "org_003",
      createdAt: "2025-06-21T10:45:00.000Z",
    },
    {
      id: "aud_004",
      fullName: "Isabelle Martin",
      tier: "LEAD",
      status: "INACTIVE",
      region: "Europe",
      organizationId: "org_004",
      createdAt: "2025-09-05T15:00:00.000Z",
    },
    {
      id: "aud_005",
      fullName: "Jamal Thompson",
      tier: "SENIOR",
      status: "ACTIVE",
      region: "North America",
      organizationId: "org_005",
      createdAt: "2025-12-18T13:30:00.000Z",
    },
  ] as AnalyticsAuditor[],
  credentials: [
    {
      id: "cred_001",
      credentialNumber: "IUCB-ISO-1001",
      standard: "ISO/IEC 27001",
      status: "VALID",
      issueDate: "2025-02-18T11:00:00.000Z",
      organizationId: "org_001",
    },
    {
      id: "cred_002",
      credentialNumber: "IUCB-ISO-1002",
      standard: "ISO 9001",
      status: "VALID",
      issueDate: "2025-05-10T12:15:00.000Z",
      organizationId: "org_002",
    },
    {
      id: "cred_003",
      credentialNumber: "IUCB-ISO-1003",
      standard: "ISO 14001",
      status: "SUSPENDED",
      issueDate: "2025-08-01T09:45:00.000Z",
      organizationId: "org_004",
    },
    {
      id: "cred_004",
      credentialNumber: "IUCB-ISO-1004",
      standard: "ISO/IEC 27701",
      status: "VALID",
      issueDate: "2025-10-11T14:20:00.000Z",
      organizationId: "org_003",
    },
    {
      id: "cred_005",
      credentialNumber: "IUCB-ISO-1005",
      standard: "ISO 22301",
      status: "REVOKED",
      issueDate: "2025-12-08T16:00:00.000Z",
      organizationId: "org_005",
    },
  ] as AnalyticsCredential[],
  applications: [
    {
      id: "app_001",
      applicantName: "Eleanor Fox",
      status: "APPROVED",
      submittedAt: "2025-03-01T08:20:00.000Z",
      organizationId: "org_001",
      standard: "ISO/IEC 27001",
    },
    {
      id: "app_002",
      applicantName: "Hassan Chowdhury",
      status: "PENDING",
      submittedAt: "2025-06-15T09:00:00.000Z",
      organizationId: "org_003",
      standard: "ISO 9001",
    },
    {
      id: "app_003",
      applicantName: "Sofia Rossi",
      status: "REJECTED",
      submittedAt: "2025-09-20T11:45:00.000Z",
      organizationId: "org_004",
      standard: "ISO 14001",
    },
    {
      id: "app_004",
      applicantName: "Thomas Nguyen",
      status: "SUBMITTED",
      submittedAt: "2025-11-28T10:30:00.000Z",
      organizationId: "org_005",
      standard: "ISO/IEC 27701",
    },
    {
      id: "app_005",
      applicantName: "Aisha Khan",
      status: "APPROVED",
      submittedAt: "2025-12-22T13:55:00.000Z",
      organizationId: "org_002",
      standard: "ISO 22301",
    },
  ] as AnalyticsApplication[],
  advisors: [
    {
      id: "adv_001",
      fullName: "Carlos Mendes",
      status: "APPROVED",
      expertiseArea: "Cybersecurity",
      organizationId: "org_001",
      approvedAt: "2025-04-05T09:15:00.000Z",
    },
    {
      id: "adv_002",
      fullName: "Priya Sharma",
      status: "PENDING",
      expertiseArea: "Quality Management",
      organizationId: "org_003",
    },
    {
      id: "adv_003",
      fullName: "Daniela Lopez",
      status: "INACTIVE",
      expertiseArea: "Data Privacy",
      organizationId: "org_002",
      approvedAt: "2025-02-17T10:45:00.000Z",
    },
  ] as AnalyticsAdvisor[],
  reports: [
    {
      reportId: "rpt_202601",
      reportType: "Organization Overview",
      generatedOn: "2026-01-11T08:00:00.000Z",
      generatedBy: "Super Admin",
      totalRecords: 52,
      organization: "Global Standards Registrar",
      standard: "ISO/IEC 27001",
    },
    {
      reportId: "rpt_202602",
      reportType: "Auditor Summary",
      generatedOn: "2026-02-08T10:30:00.000Z",
      generatedBy: "Audit Lead",
      totalRecords: 34,
      organization: "EuroCert Compliance BV",
      standard: "ISO 9001",
    },
    {
      reportId: "rpt_202603",
      reportType: "Credential Activity",
      generatedOn: "2026-03-14T14:20:00.000Z",
      generatedBy: "Compliance Officer",
      totalRecords: 41,
      organization: "Americas ISO Registrar",
      standard: "ISO 14001",
    },
  ] as AnalyticsReportMetadata[],
  auditLogs: [
    {
      timestamp: "2026-01-15T09:30:00.000Z",
      admin: "Super Admin",
      action: "GENERATE_REPORT",
      entity: "Audit Report",
      details: "Generated export for organization metrics.",
      ipAddress: "192.168.1.120",
    },
    {
      timestamp: "2026-02-07T13:22:00.000Z",
      admin: "Compliance Officer",
      action: "REFRESH_DASHBOARD",
      entity: "Dashboard Metrics",
      details: "Refreshed overview dashboard statistics.",
      ipAddress: "192.168.1.143",
    },
    {
      timestamp: "2026-03-02T11:10:00.000Z",
      admin: "Audit Lead",
      action: "EXPORT_CSV",
      entity: "Credential Analytics",
      details: "Exported credential trend data as CSV.",
      ipAddress: "192.168.1.120",
    },
  ] as AnalyticsAuditLogEntry[],
  resources: [
    { id: "res_001", title: "ISO Standards Reference", category: "Standards", createdAt: "2025-02-18T08:00:00.000Z" },
    { id: "res_002", title: "Accreditation Policy Guide", category: "Policies", createdAt: "2025-05-10T09:10:00.000Z" },
    { id: "res_003", title: "Auditor Toolkit", category: "Tools", createdAt: "2025-08-20T13:22:00.000Z" },
    { id: "res_004", title: "Cybersecurity Checklist", category: "Standards", createdAt: "2025-10-15T14:30:00.000Z" },
    { id: "res_005", title: "Data Privacy Playbook", category: "Policies", createdAt: "2025-12-01T16:45:00.000Z" },
  ] as AnalyticsResource[],
};
