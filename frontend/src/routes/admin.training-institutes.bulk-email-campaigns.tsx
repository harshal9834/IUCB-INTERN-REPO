import { createFileRoute } from "@tanstack/react-router";
import BulkEmailCampaignsPage from "../pages/training-institutes/bulk-email-campaigns";

export const Route = createFileRoute("/admin/training-institutes/bulk-email-campaigns")({
  component: BulkEmailCampaignsPage,
});