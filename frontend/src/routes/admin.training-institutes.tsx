import React from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/training-institutes")({
  component: TrainingInstitutesLayoutComponent,
});

/**
 * Layout component for Training Institutes section
 * Renders the parent layout with Outlet for child routes
 */
function TrainingInstitutesLayoutComponent() {
  return <Outlet />;
}

