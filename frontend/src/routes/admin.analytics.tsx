import { createFileRoute } from "@tanstack/react-router";
import AnalyticsDashboard from "../components/dashboard/analytics/AnalyticsDashboard";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsDashboard,
});
