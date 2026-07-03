import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "../components/reusable-components";
import { Users } from "lucide-react";

export const Route = createFileRoute("/admin/advisors")({
  component: AdvisorsComponent,
});

function AdvisorsComponent() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Advisors"
        description="Manage approved advisory board members and advisor applications"
      />
      <EmptyState
        title="No Advisors Found"
        description="No advisors have been approved yet."
        icon={<Users className="h-10 w-10" />}
      />
    </div>
  );
}
