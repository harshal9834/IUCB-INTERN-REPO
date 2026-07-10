import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronRight, XCircle, FileText } from "lucide-react";
import { PageHeader } from "../components/reusable-components";
import { DataTable, DataTableColumn } from "../components/data-table";
import { StatusBadge } from "../components/status-badge";
import { ConfirmDialog } from "../components/confirm-dialog";
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
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import credentialsApi, { Credential } from "../services/api/credentials.api";

export const Route = createFileRoute("/admin/credentials/generated")({
  component: GeneratedCredentialsComponent,
});

function GeneratedCredentialsComponent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [revokeTarget, setRevokeTarget] = useState<Credential | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Credential | null>(null);

  // Issued credentials
  const { data: issuedData, isLoading: isLoadingIssued } = useQuery({
    queryKey: ["credentials-issued"],
    queryFn: async () => {
      const res = await credentialsApi.getIssuedCredentials();
      return res.data.data.credentials;
    },
    refetchInterval: 60000,
  });

  // Pending count for the notification button
  const { data: pendingData } = useQuery({
    queryKey: ["credentials-pending"],
    queryFn: async () => {
      const res = await credentialsApi.getPendingCredentials();
      return res.data.data.pending;
    },
    refetchInterval: 30000,
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => credentialsApi.updateStatus(id, "REVOKED"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials-issued"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setRevokeTarget(null);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => credentialsApi.updateStatus(id, "SUSPENDED"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials-issued"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setSuspendTarget(null);
    },
  });

  const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();

  const getDisplayStatus = (cred: Credential): string => {
    if (cred.status === "REVOKED") return "REVOKED";
    if (cred.status === "SUSPENDED") return "SUSPENDED";
    if (isExpired(cred.expiryDate)) return "EXPIRED";
    return "VALID";
  };

  const allCreds: Credential[] = issuedData || [];
  const pendingCount: number = (pendingData || []).length;

  // Client-side filtering
  const filteredCreds = allCreds.filter((cred) => {
    const displayStatus = getDisplayStatus(cred);
    const matchesStatus = statusFilter === "ALL" || displayStatus === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      cred.credentialId.toLowerCase().includes(searchLower) ||
      (cred.organization?.organizationName || "").toLowerCase().includes(searchLower) ||
      (cred.application?.company || "").toLowerCase().includes(searchLower) ||
      (cred.auditor?.fullName || "").toLowerCase().includes(searchLower) ||
      cred.standard.toLowerCase().includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  const columns: DataTableColumn<Credential>[] = [
    {
      header: "Credential ID",
      accessor: (r) => (
        <div>
          <p className="font-mono text-xs font-semibold text-[#0F2942]">{r.credentialId}</p>
          <p className="text-xs text-slate-400 mt-0.5">{r.standard}</p>
        </div>
      ),
    },
    {
      header: "Organization",
      accessor: (r) => (
        <span className="text-sm text-slate-700">
          {r.organization?.organizationName || r.application?.company || r.application?.fullName || "—"}
        </span>
      ),
    },
    {
      header: "Auditor",
      accessor: (r) => (
        <span className="text-sm text-slate-600">{r.auditor?.fullName ?? "—"}</span>
      ),
      className: "hidden lg:table-cell",
    },
    {
      header: "Issue Date",
      accessor: (r) => (
        <span className="text-xs text-slate-500">
          {new Date(r.issueDate).toLocaleDateString()}
        </span>
      ),
      className: "hidden xl:table-cell",
    },
    {
      header: "Expiry Date",
      accessor: (r) => (
        <span
          className={`text-xs font-medium ${
            getDisplayStatus(r) === "EXPIRED" ? "text-red-600" : "text-slate-600"
          }`}
        >
          {new Date(r.expiryDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (r) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge status={getDisplayStatus(r)} />
          {r.certificateGenerated && (
            <span className="text-[10px] font-medium text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded">
              <FileText className="w-3 h-3 mr-1" />
              Cert Sent
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credentials Management"
        description="Manage the lifecycle of credentials and generation of certificates"
        action={
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/admin/credentials/pending" })}
            className={`gap-2 text-sm font-medium border transition-all ${
              pendingCount > 0
                ? "border-orange-400 text-orange-600 hover:bg-orange-50 bg-orange-50"
                : "border-slate-300 text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Bell
              className={`h-4 w-4 ${pendingCount > 0 ? "text-orange-500" : "text-slate-400"}`}
            />
            Pending Credentials
            <span
              className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold ${
                pendingCount > 0
                  ? "bg-orange-500 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {pendingCount}
            </span>
          </Button>
        }
      />

      <DataTable
        data={filteredCreds}
        columns={columns}
        isLoading={isLoadingIssued}
        searchValue={search}
        onSearchChange={(v) => setSearch(v)}
        searchPlaceholder="Search by credential no., organization, auditor…"
        emptyTitle="No credentials generated yet"
        emptyDescription="Once credentials are generated from the pending queue, they will appear here."
        headerSlot={
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v)}
          >
            <SelectTrigger className="w-32 text-xs h-9 bg-white border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="VALID">Valid</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="REVOKED">Revoked</SelectItem>
            </SelectContent>
          </Select>
        }
        actions={(cred) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-[#0F2942] hover:bg-slate-100">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => navigate({ to: `/admin/credentials/${cred.id}` })}>
                View Details
              </DropdownMenuItem>
              {cred.status === "VALID" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-amber-600 focus:text-amber-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSuspendTarget(cred);
                    }}
                  >
                    Suspend
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRevokeTarget(cred);
                    }}
                  >
                    Revoke
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={() => setRevokeTarget(null)}
        title="Revoke Credential"
        description={`Revoking credential "${revokeTarget?.credentialId}" will immediately invalidate it. This action cannot be undone.`}
        confirmLabel="Revoke Credential"
        variant="destructive"
        onConfirm={() => revokeTarget && revokeMutation.mutate(revokeTarget.id)}
        isLoading={revokeMutation.isPending}
      />

      <ConfirmDialog
        open={!!suspendTarget}
        onOpenChange={() => setSuspendTarget(null)}
        title="Suspend Credential"
        description={`Suspending credential "${suspendTarget?.credentialId}" will temporarily mark it as inactive. It can be restored later.`}
        confirmLabel="Suspend Credential"
        variant="default"
        onConfirm={() => suspendTarget && suspendMutation.mutate(suspendTarget.id)}
        isLoading={suspendMutation.isPending}
      />
    </div>
  );
}
