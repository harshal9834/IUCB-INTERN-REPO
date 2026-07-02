import { axiosInstance } from "./axios.js";

export interface DashboardMetrics {
  organizations: { total: number; active: number };
  auditors: { total: number; active: number };
  credentials: { total: number; valid: number };
  applications: { pending: number; approved: number };
  advisors: { total: number };
  resources: { total: number };
}

export interface DashboardAnalytics {
  organizationGrowth: Array<{ month: string; value: number }>;
  credentialIssuance: Array<{ month: string; value: number }>;
  applicationMetrics: { submitted: number; approved: number; rejected: number };
  auditorDistribution: Array<{ tier: string; count: number }>;
}

export const dashboardApi = {
  getMetrics: async (): Promise<{ data: { data: DashboardMetrics } }> => {
    return axiosInstance.get("/dashboard/metrics");
  },

  getAnalytics: async (): Promise<{ data: { data: DashboardAnalytics } }> => {
    return axiosInstance.get("/dashboard/analytics");
  },

  getRecentActivity: async (limit: number = 10) => {
    return axiosInstance.get(`/dashboard/activity?limit=${limit}`);
  },

  getSystemHealth: async () => {
    return axiosInstance.get("/dashboard/health");
  },

  getPendingApplications: async (limit: number = 5) => {
    return axiosInstance.get(`/dashboard/applications/pending?limit=${limit}`);
  },

  getLatestCredentials: async (limit: number = 5) => {
    return axiosInstance.get(`/dashboard/credentials/latest?limit=${limit}`);
  },

  getNotifications: async (limit: number = 5) => {
    return axiosInstance.get(`/dashboard/notifications?limit=${limit}`);
  },

  dismissNotification: async (id: string) => {
    return axiosInstance.post(`/dashboard/notifications/${id}/dismiss`);
  },
};

export default dashboardApi;
