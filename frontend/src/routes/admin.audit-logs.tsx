import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "../components/reusable-components";
import { History } from "lucide-react";

export const Route = createFileRoute("/admin/audit-logs")({
  component: AuditLogsComponent,
});

function AuditLogsComponent() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Chronological registry of administrative security events and actions"
      />

      <EmptyState
        title="No Logs Available"
        description="Audit log records are generated in real-time on database mutations. Perform system configurations to generate entries."
        icon={<History className="h-10 w-10" />}
      />
    </div>
  );
}
