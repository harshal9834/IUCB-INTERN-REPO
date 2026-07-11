import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../services/api/analytics.api";

const defaultOptions = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  retry: 2,
  refetchOnWindowFocus: false,
};

export const useAnalyticsOverview = (filters?: any) => {
  return useQuery({
    queryKey: ["analytics", "overview", filters],
    queryFn: () => analyticsApi.getOverview(filters),
    ...defaultOptions,
  });
};

export const useAnalyticsCharts = (filters?: any) => {
  return useQuery({
    queryKey: ["analytics", "charts", filters],
    queryFn: () => analyticsApi.getCharts(filters),
    ...defaultOptions,
  });
};

export const useRecentActivities = () => {
  return useQuery({
    queryKey: ["analytics", "recent-activities"],
    queryFn: () => analyticsApi.getRecentActivities(),
    ...defaultOptions,
  });
};
