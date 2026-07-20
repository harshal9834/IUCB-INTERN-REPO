import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, CheckCircle, Clock, XCircle, Filter, MoreHorizontal, Eye } from "lucide-react";
import { PageHeader } from "../components/reusable-components";
import { DataTable, DataTableColumn } from "../components/data-table";
import { StatusBadge } from "../components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import advisorsApi from "../services/api/advisors.api";
import dashboardApi from "../services/api/dashboard.api";

export const Route = createFileRoute("/admin/advisory")({
  component: AdvisoryBoardComponent,
});

interface Advisor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  country: string;
  countryCode: string;
  phoneCode: string;
  state: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

function AdvisoryBoardComponent() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const queryKey = ["advisors", page, limit, search, statusFilter];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await advisorsApi.getAdvisors(params);
      return res.data.data;
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

  const columns: DataTableColumn<Advisor>[] = [
    {
      header: "Member Name",
      accessor: (r) => (
        <div 
          className="cursor-pointer hover:text-blue-600"
          onClick={(e) => { e.stopPropagation(); navigate({ to: "/admin/advisory/$id", params: { id: r.id } }); }}
        >
          <p className="font-semibold text-[#0F2942] text-sm hover:text-blue-600 transition-colors">{r.fullName}</p>
          <p className="text-xs text-slate-400 mt-0.5">{(r as any).application?.email || r.email || "—"}</p>
        </div>
      ),
    },
    { header: "Organization", accessor: "organization" },
    { header: "Designation", accessor: "designation", className: "hidden md:table-cell" },
    { header: "City", accessor: (r) => (r as any).application?.city || r.city || "—", className: "hidden lg:table-cell" },
    { header: "State", accessor: (r) => (r as any).application?.state || r.state || "—", className: "hidden lg:table-cell" },
    { header: "Country", accessor: (r) => (r as any).application?.country || r.country || "—", className: "hidden lg:table-cell" },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    {
      header: "Joined Date",
      accessor: (r) => <span className="text-xs">{new Date(r.createdAt).toLocaleDateString()}</span>,
      className: "hidden xl:table-cell",
    },
  ];

  const advisors: Advisor[] = data?.advisors ?? [];
  const pagination = data?.pagination;

  // KPIs
  const total = metricsData?.advisors?.total ?? 0;
  const active = metricsData?.advisors?.active ?? 0;
  const inactive = metricsData?.advisors?.inactive ?? (total - active);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Advisory Board"
        description="Manage the independent IUCB advisory board members"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{total}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{active}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{inactive > 0 ? inactive : 0}</div>}
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={advisors}
        columns={columns}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name, organization, country…"
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={setPage}
        total={pagination?.total}
        emptyTitle="No advisory board members found"
        emptyDescription="There are currently no active advisory board members."
        onRowClick={(row) => navigate({ to: "/admin/advisory/$id", params: { id: row.id } })}
        headerSlot={
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px] text-xs h-9 bg-white border-slate-200">
                <Filter className="w-3 h-3 mr-2" />
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={limit.toString()} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[80px] text-xs h-9 bg-white border-slate-200">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        actions={(row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate({ to: "/admin/advisory/$id", params: { id: row.id } }); }}>
                <Eye className="mr-2 h-3.5 w-3.5" /> View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />
    </div>
  );
}
