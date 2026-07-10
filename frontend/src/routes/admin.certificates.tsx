import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "../components/reusable-components";

export const Route = createFileRoute("/admin/certificates")({
  component: CertificatesPlaceholderComponent,
});

function CertificatesPlaceholderComponent() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Certificates"
        description="Manage system certificates"
      />
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed bg-slate-50 text-slate-500">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Coming Soon</h3>
        <p>The certificates module is currently under development.</p>
      </div>
    </div>
  );
}
