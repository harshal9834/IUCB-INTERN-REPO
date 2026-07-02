import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { dashboardApi, DashboardMetrics } from "../services/api/dashboard.api";
import { ActivityItem } from "../components/dashboard/activity-timeline";
import { HealthIndicator } from "../components/dashboard/system-health";
import { PendingApplication } from "../components/dashboard/pending-applications-widget";
import { Notification } from "../components/dashboard/notification-card";

// Mock data generators
const generateMockMetrics = (): DashboardMetrics => ({
  organizations: { total: 127, active: 118 },
  auditors: { total: 2045, active: 1987 },
  credentials: { total: 8934, valid: 8756 },
  applications: { pending: 23, approved: 156 },
  advisors: { total: 89 },
  resources: { total: 342 },
});

const generateMockActivity = (): ActivityItem[] => [
  {
    id: "1",
    type: "credential",
    title: "ISO 27001 Certificate Issued",
    description: "EuroCert International - Credential ID: IUCB-CRD-2024-0821",
    timestamp: new Date(Date.now() - 15 * 60000),
    icon: null,
    color: "emerald",
  },
  {
    id: "2",
    type: "organization",
    title: "New Organization Approved",
    description: "NordAudit AS - Sweden",
    timestamp: new Date(Date.now() - 45 * 60000),
    icon: null,
    color: "blue",
  },
  {
    id: "3",
    type: "auditor",
    title: "Auditor Profile Updated",
    description: "Dr. Aisha Khan - Lead Auditor",
    timestamp: new Date(Date.now() - 2 * 3600000),
    icon: null,
    color: "violet",
  },
  {
    id: "4",
    type: "application",
    title: "Advisory Application Submitted",
    description: "Application ID: APP-2024-0442",
    timestamp: new Date(Date.now() - 4 * 3600000),
    icon: null,
    color: "amber",
  },
  {
    id: "5",
    type: "approval",
    title: "Application Approved",
    description: "Advisory Board Member - Effective immediately",
    timestamp: new Date(Date.now() - 6 * 3600000),
    icon: null,
    color: "green",
  },
  {
    id: "6",
    type: "news",
    title: "News Article Published",
    description: "ISO/IEC 27001:2026 Transition Update",
    timestamp: new Date(Date.now() - 8 * 3600000),
    icon: null,
    color: "slate",
  },
];

const generateMockSystemHealth = (): HealthIndicator[] => [
  {
    name: "Database",
    status: "operational",
    uptime: "99.98%",
    lastChecked: new Date(),
    icon: null,
  },
  {
    name: "API Gateway",
    status: "operational",
    uptime: "99.95%",
    lastChecked: new Date(),
    icon: null,
  },
  {
    name: "Authentication Service",
    status: "operational",
    uptime: "99.99%",
    lastChecked: new Date(),
    icon: null,
  },
  {
    name: "Email Service",
    status: "operational",
    uptime: "98.5%",
    lastChecked: new Date(),
    icon: null,
  },
  {
    name: "Storage",
    status: "operational",
    uptime: "99.9%",
    lastChecked: new Date(),
    icon: null,
  },
  {
    name: "Backup System",
    status: "operational",
    uptime: "99.9%",
    lastChecked: new Date(),
    icon: null,
  },
];

const generateMockPendingApplications = (): PendingApplication[] => [
  {
    id: "APP-001",
    applicantName: "Dr. John Davidson",
    type: "Advisory Board",
    status: "Pending",
    submittedDate: new Date(Date.now() - 3 * 86400000),
  },
  {
    id: "APP-002",
    applicantName: "GreenCert International",
    type: "Auditor Accreditation",
    status: "Pending",
    submittedDate: new Date(Date.now() - 5 * 86400000),
  },
  {
    id: "APP-003",
    applicantName: "Training Academy Europe",
    type: "Training Provider",
    status: "Pending",
    submittedDate: new Date(Date.now() - 7 * 86400000),
  },
];

const generateMockNotifications = (): Notification[] => [
  {
    id: "NOT-001",
    type: "info",
    title: "New Accreditation Request",
    message: "AsiaPacific Audit Services submitted an accreditation request",
    timestamp: new Date(Date.now() - 10 * 60000),
  },
  {
    id: "NOT-002",
    type: "warning",
    title: "Credential Expiring Soon",
    message: "EuroCert International - ISO 27001 expires in 15 days",
    timestamp: new Date(Date.now() - 30 * 60000),
  },
  {
    id: "NOT-003",
    type: "critical",
    title: "System Update Required",
    message: "Security patch available - please schedule maintenance window",
    timestamp: new Date(Date.now() - 2 * 3600000),
  },
];

export const useDashboardMetrics = (): UseQueryResult<DashboardMetrics> => {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      try {
        const res = await dashboardApi.getMetrics();
        return res.data.data;
      } catch (error) {
        // Fall back to mock data
        return generateMockMetrics();
      }
    },
    staleTime: 30_000,
    retry: 1,
  });
};

export const useDashboardActivity = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: async () => {
      try {
        const res = await dashboardApi.getRecentActivity(10);
        return res.data.data;
      } catch (error) {
        return generateMockActivity();
      }
    },
    enabled,
    staleTime: 60_000,
    retry: 1,
  });
};

export const useSystemHealth = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      try {
        const res = await dashboardApi.getSystemHealth();
        return res.data.data;
      } catch (error) {
        return generateMockSystemHealth();
      }
    },
    enabled,
    staleTime: 60_000,
    retry: 1,
  });
};

export const usePendingApplications = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["pending-applications"],
    queryFn: async () => {
      try {
        const res = await dashboardApi.getPendingApplications(5);
        return res.data.data;
      } catch (error) {
        return generateMockPendingApplications();
      }
    },
    enabled,
    staleTime: 120_000,
    retry: 1,
  });
};

export const useDashboardNotifications = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard-notifications"],
    queryFn: async () => {
      try {
        const res = await dashboardApi.getNotifications(5);
        return res.data.data;
      } catch (error) {
        return generateMockNotifications();
      }
    },
    enabled,
    staleTime: 60_000,
    retry: 1,
  });
};
