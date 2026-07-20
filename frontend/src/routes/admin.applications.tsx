import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Building2,
  UserCheck,
  GraduationCap,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  Filter,
} from "lucide-react";
import { PageHeader } from "../components/reusable-components";
import { DataTable, DataTableColumn } from "../components/data-table";
import { StatusBadge } from "../components/status-badge";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import applicationsApi, { Application, ApplicationType } from "../services/api/applications.api";
import dashboardApi from "../services/api/dashboard.api";

export const Route = createFileRoute("/admin/applications")({
  component: ApplicationsComponent,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ApplicationType, { label: string; icon: any; color: string; bg: string }> = {
  ACCREDITATION: { label: "Accreditation", icon: Building2, color: "text-blue-700", bg: "bg-blue-50" },
  AUDITOR: { label: "Auditor", icon: UserCheck, color: "text-violet-700", bg: "bg-violet-50" },
  TRAINING_INSTITUTE: { label: "Training Institute", icon: GraduationCap, color: "text-amber-700", bg: "bg-amber-50" },
  ADVISORY: { label: "Advisory Board", icon: Users, color: "text-emerald-700", bg: "bg-emerald-50" },
};

function TypeBadge({ type }: { type: ApplicationType }) {
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

function ApplicationsComponent() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const queryKey = ["applications", page, limit, search, statusFilter, typeFilter];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (typeFilter !== "ALL") params.type = typeFilter;
      const res = await applicationsApi.getApplications(params);
      return (res as any).data.data;
    },
    staleTime: 10_000,
  });

  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const res = await dashboardApi.getMetrics();
      return res.data.data;
    },
    staleTime: 60_000,
  });

  const applications: Application[] = data?.applications ?? [];
  const pagination = data?.pagination;
  const pendingCount = metricsData?.applications?.pending ?? 0;
  const approvedCount = metricsData?.applications?.approved ?? 0;

  const columns: DataTableColumn<Application>[] = [
    {
      header: "App Number",
      accessor: (r) => (
        <span className="font-mono text-xs font-semibold text-slate-600">
          {r.applicationNumber ?? "—"}
        </span>
      ),
      className: "hidden md:table-cell",
    },
    {
      header: "Applicant",
      accessor: (r) => (
        <div>
          <p className="font-semibold text-[#0F2942] text-sm">{r.fullName}</p>
          <p className="text-xs text-slate-400 mt-0.5">{r.email}</p>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (r) => <TypeBadge type={r.applicationType} />,
    },
    {
      header: "Organization",
      accessor: (r) => (
        <span className="text-sm text-slate-600">{r.company ?? "—"}</span>
      ),
      className: "hidden lg:table-cell",
    },
    {
      header: "Location",
      accessor: (r) => (
        <span className="text-sm text-slate-600">
          {[r.city, r.state, r.country].filter(Boolean).join(", ") || "—"}
        </span>
      ),
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      accessor: (r) => <StatusBadge status={r.applicationStatus} />,
    },
    {
      header: "Submitted",
      accessor: (r) => (
        <span className="text-xs text-slate-500">
          {new Date(r.createdAt).toLocaleDateString()}
        </span>
      ),
      className: "hidden xl:table-cell",
    },
    {
      header: "",
      accessor: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate({ to: `/admin/applications/${r.id}` });
          }}
          className="p-1 hover:bg-slate-200 rounded transition-colors"
          aria-label="View details"
        >
          <ChevronRight className="h-4 w-4 text-slate-400 hover:text-slate-600" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Review and process accreditation, auditor, training institute, and advisory applications"
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            )}
            <p className="text-xs text-slate-400 mt-1">Awaiting decision</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold text-green-700">{approvedCount}</div>
            )}
            <p className="text-xs text-slate-400 mt-1">Total approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accreditation</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(a => a.applicationType === "ACCREDITATION").length}
            </div>
            <p className="text-xs text-slate-400 mt-1">Org applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advisory</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {applications.filter(a => a.applicationType === "ADVISORY").length}
            </div>
            <p className="text-xs text-slate-400 mt-1">Board applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <DataTable
        data={applications}
        columns={columns}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name, email, org, app number…"
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={setPage}
        total={pagination?.total}
        emptyTitle="No applications found"
        emptyDescription="Applications submitted through the public portal will appear here."
        onRowClick={(row) => navigate({ to: `/admin/applications/${row.id}` })}
        headerSlot={
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px] text-xs h-9 bg-white border-slate-200">
                <Filter className="w-3 h-3 mr-2 flex-shrink-0" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="ACCREDITATION">Accreditation</SelectItem>
                <SelectItem value="AUDITOR">Auditor</SelectItem>
                <SelectItem value="TRAINING_INSTITUTE">Training Institute</SelectItem>
                <SelectItem value="ADVISORY">Advisory Board</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[130px] text-xs h-9 bg-white border-slate-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={limit.toString()} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[90px] text-xs h-9 bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="15">15 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
