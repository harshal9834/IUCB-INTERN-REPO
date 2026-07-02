import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, EmptyState } from "../components/reusable-components";
import { Newspaper, Plus } from "lucide-react";
import { Button } from "../components/ui/button";

export const Route = createFileRoute("/admin/content")({
  component: ContentComponent,
});

function ContentComponent() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Content Management"
        description="Publish announcements, global accreditation volume news, and guidelines resources"
        action={
          <Button className="bg-[#0F2942] hover:bg-[#1a446c] text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Article
          </Button>
        }
      />

      <EmptyState
        title="No Content Found"
        description="No articles or resources have been published to the portal yet."
        icon={<Newspaper className="h-10 w-10" />}
      />
    </div>
  );
}
