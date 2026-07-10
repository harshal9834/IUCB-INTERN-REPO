import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, CheckCircle, Filter } from "lucide-react";
import { PageHeader } from "../components/reusable-components";
import { DataTable, DataTableColumn } from "../components/data-table";
import { StatusBadge } from "../components/status-badge";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import credentialsApi from "../services/api/credentials.api";

export const Route = createFileRoute("/admin/credentials/pending")({
  component: PendingCredentialsComponent,
});

const APP_TYPE_LABELS: Record<string, string> = {
  ACCREDITATION:      "Organization",
  AUDITOR:            "Auditor",
  TRAINING_INSTITUTE: "Training Institute",
  ADVISORY:           "Advisory Board",
};

const APP_TYPE_BADGE_CLASS: Record<string, string> = {
  ACCREDITATION:      "text-blue-700 bg-blue-50 border-blue-200",
  AUDITOR:            "text-violet-700 bg-violet-50 border-violet-200",
  TRAINING_INSTITUTE: "text-amber-700 bg-amber-50 border-amber-200",
  ADVISORY:           "text-emerald-700 bg-emerald-50 border-emerald-200",
};

function PendingCredentialsComponent() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data: pendingData, isLoading } = useQuery({
    queryKey: ["credentials-pending"],
    queryFn: async () => {
      const res = await credentialsApi.getPendingCredentials();
      return res.data.data.pending;
    },
    refetchInterval: 30_000,
  });

  const pendingApps: any[] = (pendingData || []).filter((app: any) => {
    const matchType = typeFilter === "ALL" || app.applicationType === typeFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      app.fullName?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q) ||
      app.applicationNumber?.toLowerCase().includes(q) ||
      app.company?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const columns: DataTableColumn<any>[] = [
    {
      header: "Application",
      accessor: (r) => (
        <div>
          <p className="font-mono text-xs font-bold text-[#0F2942]">{r.applicationNumber || "—"}</p>
          <span className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full border font-semibold ${APP_TYPE_BADGE_CLASS[r.applicationType] ?? "bg-slate-100 text-slate-600"}`}>
            {APP_TYPE_LABELS[r.applicationType] ?? r.applicationType}
          </span>
        </div>
      ),
    },
    {
      header: "Applicant",
      accessor: (r) => (
        <div>
          <p className="font-semibold text-sm text-[#0F2942]">{r.fullName}</p>
          <p className="text-xs text-slate-400 mt-0.5">{r.email}</p>
        </div>
      ),
    },
    {
      header: "Organization",
      accessor: (r) => <span className="text-sm text-slate-600">{r.company || "—"}</span>,
      className: "hidden lg:table-cell",
    },
    {
      header: "Country",
      accessor: (r) => <span className="text-sm text-slate-600">{r.country || "—"}</span>,
      className: "hidden xl:table-cell",
    },
    {
      header: "Approved",
      accessor: (r) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
          {r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString() : "—"}
        </div>
      ),
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: (r) => <StatusBadge status={r.applicationStatus} />,
    },
    {
      header: "Action",
      accessor: (r) => (
        <Button
          size="sm"
          className="bg-[#0F2942] hover:bg-[#1a446c] text-white text-xs h-8 gap-1.5 shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: "/admin/credentials/generate/$applicationId", params: { applicationId: r.id } });
          }}
        >
          <Award className="w-3.5 h-3.5" /> Generate
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Credentials"
        description="Approved applications awaiting credential generation. Click 'Generate' to issue a credential."
      />

      {/* Summary Banner */}
      <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <Award className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <p className="font-semibold">
            {pendingApps.length} application{pendingApps.length !== 1 ? "s" : ""} awaiting credential generation
          </p>
          <p className="text-amber-700 text-xs mt-0.5">
            Clicking <strong>Generate</strong> opens the universal credential review form — no manual data entry required.
          </p>
        </div>
      </div>

      <DataTable
        data={pendingApps}
        columns={columns}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, application number..."
        emptyTitle="No pending credentials"
        emptyDescription="All approved applications have had their credentials generated."
        onRowClick={(row) =>
          navigate({ to: "/admin/credentials/generate/$applicationId", params: { applicationId: row.id } })
        }
        headerSlot={
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px] text-xs h-9 bg-white border-slate-200">
              <Filter className="w-3 h-3 mr-2" />
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="ACCREDITATION">Organization</SelectItem>
              <SelectItem value="AUDITOR">Auditor</SelectItem>
              <SelectItem value="TRAINING_INSTITUTE">Training Institute</SelectItem>
              <SelectItem value="ADVISORY">Advisory Board</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
