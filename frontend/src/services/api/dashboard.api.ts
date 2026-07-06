import { axiosInstance as apiClient } from "./axios";

export interface DashboardOverview {
  organizations: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  auditors: {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
  };
  trainingInstitutes: {
    total: number;
    active: number;
    inactive: number;
  };
  advisors: {
    total: number;
    active: number;
    inactive: number;
  };
  credentials: {
    pending: number;
    generated: number;
    valid: number;
    expired: number;
    revoked: number;
  };
  lists: {
    pendingApplications: any[];
    pendingCredentials: any[];
    recentApprovals: any[];
    recentCredentials: any[];
    recentOrganizations: any[];
    recentAuditors: any[];
  };
}

const dashboardApi = {
  getMetrics: () => apiClient.get("/dashboard/metrics"),
  getOverview: () => apiClient.get("/dashboard/overview"),
};

export default dashboardApi;
