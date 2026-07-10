import { axiosInstance } from "./axios";

export interface AnalyticsDashboardData {
  metrics: Array<{ id: string; title: string; value: number; delta: number; trend: string }>;
  organizationGrowth: Array<{ period: string; count: number }>;
  auditorTier: Array<{ name: string; value: number; color?: string }>;
  credentialStatus: Array<{ name: string; value: number; color?: string }>;
  applicationTrend: Array<{ period: string; submitted: number; approved: number }>;
  advisorStats: { total: number; licensed: number; pending: number; inactive: number };
  standards: Array<{ name: string; percent: number; color?: string }>;
  reports: Array<{ id: string; timestamp: string; admin: string; action: string; entity: string; details: string; ip: string }>;
}

export interface AnalyticsFiltersData {
  organizations: Array<{ id: string; name: string }>;
  standards: string[];
  reportTypes: string[];
}

export const analyticsApi = {
  getDashboard: async (params?: any) => {
    return axiosInstance.get("/analytics/dashboard", { params });
  },

  getFilters: async () => {
    return axiosInstance.get("/analytics/filters");
  },

  getReports: async (params?: any) => {
    return axiosInstance.get("/analytics/reports", { params });
  },

  exportReport: async (format: "csv" | "excel" | "pdf", params?: any) => {
    return axiosInstance.get("/analytics/export", {
      params: { ...params, format },
      responseType: "blob",
    });
  },
};

export default analyticsApi;
