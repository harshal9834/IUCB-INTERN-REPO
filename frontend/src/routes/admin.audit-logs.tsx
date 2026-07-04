import { createFileRoute } from "@tanstack/react-router";
import AuditDashboard from "../components/dashboard/audit/AuditDashboard";

export const Route = createFileRoute("/admin/audit-logs")({
  component: AuditDashboard,
});
