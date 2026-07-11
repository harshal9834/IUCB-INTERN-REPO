import { axiosInstance } from "./axios";
import { AnalyticsOverview, ChartDataResponse, RecentActivitiesResponse } from "../../types/analytics";

export const analyticsApi = {
  // ─── Original Main methods ──────────────────────────────────────────────
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

  // ─── Per-category summary endpoints ────────────────────────────────────
  getOrganizationSummary: async (params?: any) => {
    return axiosInstance.get("/analytics/organizations", { params });
  },

  getApplicationSummary: async (params?: any) => {
    return axiosInstance.get("/analytics/applications", { params });
  },

  getCredentialSummary: async (params?: any) => {
    return axiosInstance.get("/analytics/credentials", { params });
  },

  getAuditorSummary: async (params?: any) => {
    return axiosInstance.get("/analytics/auditors", { params });
  },

  getAdvisorSummary: async (params?: any) => {
    return axiosInstance.get("/analytics/advisors", { params });
  },

  getAuditLogs: async (params?: any) => {
    return axiosInstance.get("/analytics/audit-logs", { params });
  },

  getResourceSummary: async (params?: any) => {
    return axiosInstance.get("/analytics/resources", { params });
  },

  getTrainingInstituteSummary: async (params?: any) => {
    return axiosInstance.get("/analytics/training-institutes", { params });
  },

  // ─── New endpoints (added during analytics fix) ─────────────────────────
  getOverview: async (filters?: any): Promise<AnalyticsOverview> => {
    const response = await axiosInstance.get("/analytics/overview", { params: filters });
    return response.data.data;
  },

  getCharts: async (filters?: any): Promise<ChartDataResponse> => {
    const response = await axiosInstance.get("/analytics/charts", { params: filters });
    return response.data.data;
  },

  getRecentActivities: async (): Promise<RecentActivitiesResponse> => {
    const response = await axiosInstance.get("/analytics/recent-activities");
    return response.data.data;
  },

  exportExcel: async (filters?: any) => {
    const response = await axiosInstance.get("/analytics/export/excel", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  },
};

export default analyticsApi;
