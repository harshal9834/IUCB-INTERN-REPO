import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "../components/reusable-components";
import { BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsComponent,
});

function AnalyticsComponent() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        description="Monitor accreditation metrics, audit counts, and geographic distributions"
      />

      <EmptyState
        title="Analytics Preparing"
        description="Systems are compiling statistics. Geographic and volume charts will be active once audit cycles commit records."
        icon={<BarChart3 className="h-10 w-10" />}
      />
    </div>
  );
}
