import { axiosInstance } from "./axios";
import { AnalyticsOverview, ChartDataResponse, RecentActivitiesResponse } from "../../types/analytics";

export const analyticsApi = {
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
      responseType: "blob"
    });
    return response.data;
  }
};
