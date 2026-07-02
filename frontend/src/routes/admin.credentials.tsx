import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, XCircle } from "lucide-react";
import { PageHeader } from "../components/reusable-components";
import { DataTable, DataTableColumn } from "../components/data-table";
import { StatusBadge } from "../components/status-badge";
import { ConfirmDialog } from "../components/confirm-dialog";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import credentialsApi from "../services/api/credentials.api";
import organizationsApi from "../services/api/organizations.api";
import auditorsApi from "../services/api/auditors.api";

export const Route = createFileRoute("/admin/credentials")({
  component: CredentialsComponent,
});

interface Credential {
  id: string;
  credentialNumber: string;
  standard: string;
  issueDate: string;
  expiryDate: string;
  status: "VALID" | "REVOKED" | "EXPIRED";
  organizationId: string;
  auditorId: string;
  verificationUrl: string;
  organization?: { id: string; organizationName: string };
  auditor?: { id: string; fullName: string };
}

const defaultForm = {
  credentialNumber: "",
  standard: "",
  issueDate: "",
  expiryDate: "",
  organizationId: "",
  auditorId: "",
  verificationUrl: "",
};

function CredentialsComponent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<Credential | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");

  const queryKey = ["credentials", page, search, statusFilter];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await credentialsApi.getCredentials(params);
      return res.data.data;
    },
    staleTime: 10_000,
  });

  const { data: orgsData } = useQuery({
    queryKey: ["organizations-all"],
    queryFn: async () => {
      const res = await organizationsApi.getOrganizations({ limit: 200 });
      return res.data.data;
    },
    staleTime: 60_000,
  });

  const { data: auditorsData } = useQuery({
    queryKey: ["auditors-all"],
    queryFn: async () => {
      const res = await auditorsApi.getAuditors({ limit: 200 });
      return res.data.data;
    },
    staleTime: 60_000,
  });

  const issueMutation = useMutation({
    mutationFn: (payload: any) => credentialsApi.issueCredential(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setIssueModalOpen(false);
      setForm(defaultForm);
    },
    onError: (err: any) =>
      setFormError(err?.response?.data?.message ?? "Failed to issue credential"),
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => credentialsApi.revokeCredential(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credentials"] });
      setRevokeTarget(null);
    },
  });

  const openIssue = () => {
    setForm(defaultForm);
    setFormError("");
    setIssueModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    issueMutation.mutate(form);
  };

  const credentials: Credential[] = data?.credentials ?? [];
  const pagination = data?.pagination;
  const organizations = orgsData?.organizations ?? [];
  const auditors = auditorsData?.auditors ?? [];

  const isExpired = (expiryDate: string) => new Date(expiryDate) < new Date();

  const columns: DataTableColumn<Credential>[] = [
    {
      header: "Credential No.",
      accessor: (r) => (
        <div>
          <p className="font-mono text-xs font-semibold text-[#0F2942]">{r.credentialNumber}</p>
          <p className="text-xs text-slate-400 mt-0.5">{r.standard}</p>
        </div>
      ),
    },
    {
      header: "Organization",
      accessor: (r) => (
        <span className="text-sm text-slate-700">{r.organization?.organizationName ?? "—"}</span>
      ),
    },
    {
      header: "Auditor",
      accessor: (r) => <span className="text-sm text-slate-600">{r.auditor?.fullName ?? "—"}</span>,
      className: "hidden lg:table-cell",
    },
    {
      header: "Issue Date",
      accessor: (r) => (
        <span className="text-xs">{new Date(r.issueDate).toLocaleDateString()}</span>
      ),
      className: "hidden xl:table-cell",
    },
    {
      header: "Expiry",
      accessor: (r) => (
        <span
          className={`text-xs font-medium ${isExpired(r.expiryDate) && r.status === "VALID" ? "text-red-600" : "text-slate-600"}`}
        >
          {new Date(r.expiryDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (r) => (
        <StatusBadge
          status={isExpired(r.expiryDate) && r.status === "VALID" ? "EXPIRED" : r.status}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credentials"
        description="Issue and manage ISO accreditation credentials"
        action={
          <Button onClick={openIssue} className="bg-[#0F2942] hover:bg-[#1a446c] text-white gap-2">
            <Plus className="h-4 w-4" /> Issue Credential
          </Button>
        }
      />

      <DataTable
        data={credentials}
        columns={columns}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by credential no., standard…"
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={setPage}
        total={pagination?.total}
        emptyTitle="No credentials found"
        emptyDescription="Issue your first ISO credential to an accredited organization."
        headerSlot={
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-32 text-xs h-9 bg-white border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="VALID">Valid</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
              <SelectItem value="REVOKED">Revoked</SelectItem>
            </SelectContent>
          </Select>
        }
        actions={(cred) =>
          cred.status === "VALID" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => setRevokeTarget(cred)}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <XCircle className="mr-2 h-3.5 w-3.5" /> Revoke
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-xs text-slate-400 px-3">—</span>
          )
        }
      />

      {/* Issue Credential Modal */}
      <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue New Credential</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Credential Number *</Label>
                <Input
                  value={form.credentialNumber}
                  onChange={(e) => setForm((f) => ({ ...f, credentialNumber: e.target.value }))}
                  placeholder="e.g. IUCB-ISO-2024-001"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>ISO Standard *</Label>
                <Input
                  value={form.standard}
                  onChange={(e) => setForm((f) => ({ ...f, standard: e.target.value }))}
                  placeholder="e.g. ISO 9001:2015"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Organization *</Label>
                <Select
                  value={form.organizationId}
                  onValueChange={(v) => setForm((f) => ({ ...f, organizationId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization…" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org: any) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.organizationName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Auditor *</Label>
                <Select
                  value={form.auditorId}
                  onValueChange={(v) => setForm((f) => ({ ...f, auditorId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select auditor…" />
                  </SelectTrigger>
                  <SelectContent>
                    {auditors.map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Issue Date *</Label>
                <Input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Expiry Date *</Label>
                <Input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Verification URL *</Label>
                <Input
                  type="url"
                  value={form.verificationUrl}
                  onChange={(e) => setForm((f) => ({ ...f, verificationUrl: e.target.value }))}
                  placeholder="https://verify.iucb.org/..."
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIssueModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0F2942] hover:bg-[#1a446c] text-white"
                disabled={issueMutation.isPending}
              >
                {issueMutation.isPending ? "Issuing…" : "Issue Credential"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm */}
      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={() => setRevokeTarget(null)}
        title="Revoke Credential"
        description={`Revoking credential "${revokeTarget?.credentialNumber}" will immediately invalidate it. This action cannot be undone.`}
        confirmLabel="Revoke Credential"
        variant="destructive"
        onConfirm={() => revokeTarget && revokeMutation.mutate(revokeTarget.id)}
        isLoading={revokeMutation.isPending}
      />
    </div>
  );
}
