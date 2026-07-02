import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "../components/reusable-components";
import { User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/admin/profile")({
  component: ProfileComponent,
});

function ProfileComponent() {
  return (
    <div className="space-y-6">
      <PageHeader title="Admin Profile" description="View or configure your user account details" />

      <EmptyState
        title="Profile Overview"
        description="Verify role status, account email addresses, and key settings options."
        icon={<UserIcon className="h-10 w-10" />}
      />
    </div>
  );
}
