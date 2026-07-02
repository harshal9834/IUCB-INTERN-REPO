import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "../components/reusable-components";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure admin workspace, security rules, and metadata parameters"
      />

      <EmptyState
        title="Settings Loading"
        description="Systems configurations options are locking under Super Admin rules."
        icon={<SettingsIcon className="h-10 w-10" />}
      />
    </div>
  );
}
