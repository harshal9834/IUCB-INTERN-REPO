import { useQuery } from "@tanstack/react-query";
import dashboardApi from "../services/api/dashboard.api";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const res = await dashboardApi.getOverview();
      return res.data.data; // This will return the DashboardOverview structure
    },
    refetchInterval: 30000, // refresh every 30 seconds automatically
  });
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await dashboardApi.getMetrics();
      return res.data.data;
    },
    refetchInterval: 30000,
  });
}
