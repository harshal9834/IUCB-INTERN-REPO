import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

import { useAnalyticsOverview, useAnalyticsCharts, useRecentActivities } from "../hooks/useAnalytics";
import { analyticsApi } from "../services/api/analytics.api";
import { FilterQuery } from "../types/analytics";

import { AnalyticsHeader } from "../components/analytics/AnalyticsHeader";
import { AnalyticsFilters } from "../components/analytics/AnalyticsFilters";
import { KpiGrid } from "../components/analytics/KpiGrid";
import { OverviewCharts } from "../components/analytics/OverviewCharts";
import { RecentActivities } from "../components/analytics/RecentActivities";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsDashboard,
});

function AnalyticsDashboard() {
  const [filters, setFilters] = useState<FilterQuery>({});
  const [isExporting, setIsExporting] = useState(false);

  const { data: overview, isLoading: isOverviewLoading, isError: isOverviewError, refetch: refetchOverview } = useAnalyticsOverview(filters);
  const { data: charts, isLoading: isChartsLoading, isError: isChartsError, refetch: refetchCharts } = useAnalyticsCharts(filters);
  const { data: recent, isLoading: isRecentLoading, isError: isRecentError, refetch: refetchRecent } = useRecentActivities();

  const handleRefresh = () => {
    refetchOverview();
    refetchCharts();
    refetchRecent();
    toast.success("Analytics data refreshed");
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await analyticsApi.exportExcel(filters);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'IUCB Analytics Report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful");
    } catch (error) {
      console.error("Export error", error);
      toast.error("Failed to export Excel report");
    } finally {
      setIsExporting(false);
    }
  };

  const isError = isOverviewError || isChartsError || isRecentError;
  const isLoading = isOverviewLoading || isChartsLoading || isRecentLoading;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 bg-card rounded-xl border p-8 shadow-sm">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold">Data Unavailable</h2>
        <p className="text-muted-foreground">There was an error loading the analytics data. Please try again.</p>
        <button onClick={handleRefresh} className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium mt-2">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 bg-background">
      <AnalyticsHeader 
        onRefresh={handleRefresh} 
        onExport={handleExport} 
        isExporting={isExporting} 
      />
      
      <AnalyticsFilters 
        filters={filters} 
        onChange={setFilters} 
      />
      
      {isLoading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-[250px] bg-muted rounded-xl"></div>
          <div className="h-[350px] bg-muted rounded-xl"></div>
        </div>
      ) : (
        <>
          <KpiGrid data={overview} />
          {charts && <OverviewCharts data={charts} />}
          <RecentActivities data={recent} />
        </>
      )}
    </div>
  );
}
