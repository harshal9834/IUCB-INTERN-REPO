import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import auditorsApi from "../services/api/auditors.api";
import organizationsApi from "../services/api/organizations.api";

export const Route = createFileRoute("/admin/auditors")({
  component: AuditorsComponent,
});

interface Auditor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  tier: "ASSOCIATE" | "SENIOR" | "LEAD";
  specialization: string;
  experienceYears: number;
  status: string;
  organizationId: string;
  organization?: { id: string; organizationName: string };
  createdAt: string;
}

interface AuditorForm {
  fullName: string;
  email: string;
  phone: string;
  organizationId: string;
  tier: "ASSOCIATE" | "SENIOR" | "LEAD";
  specialization: string;
  experienceYears: number;
  status: string;
}

const defaultForm: AuditorForm = {
  fullName: "",
  email: "",
  phone: "",
  organizationId: "",
  tier: "ASSOCIATE",
  specialization: "",
  experienceYears: 0,
  status: "ACTIVE",
};

function AuditorsComponent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Auditor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Auditor | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");

  const queryKey = ["auditors", page, search, tierFilter];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (tierFilter !== "ALL") params.tier = tierFilter;
      const res = await auditorsApi.getAuditors(params);
      return res.data.data;
    },
    staleTime: 10_000,
  });

  // Load organizations for the dropdown
  const { data: orgsData } = useQuery({
    queryKey: ["organizations-all"],
    queryFn: async () => {
      const res = await organizationsApi.getOrganizations({ limit: 200 });
      return res.data.data;
    },
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => auditorsApi.createAuditor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditors"] });
      closeModal();
    },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? "Failed to create auditor"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      auditorsApi.updateAuditor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditors"] });
      closeModal();
    },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? "Failed to update auditor"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => auditorsApi.deleteAuditor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditors"] });
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditTarget(null);
    setForm(defaultForm);
    setFormError("");
    setModalOpen(true);
  };
  const openEdit = (a: Auditor) => {
    setEditTarget(a);
    setForm({
      fullName: a.fullName,
      email: a.email,
      phone: a.phone,
      organizationId: a.organizationId,
      tier: a.tier,
      specialization: a.specialization,
      experienceYears: a.experienceYears,
      status: a.status,
    });
    setFormError("");
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setFormError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const auditors: Auditor[] = data?.auditors ?? [];
  const pagination = data?.pagination;
  const organizations = orgsData?.organizations ?? [];

  const columns: DataTableColumn<Auditor>[] = [
    {
      header: "Name",
      accessor: (r) => (
        <div>
          <p className="font-semibold text-[#0F2942] text-sm">{r.fullName}</p>
          <p className="text-xs text-slate-400 mt-0.5">{r.email}</p>
        </div>
      ),
    },
    {
      header: "Organization",
      accessor: (r) => (
        <span className="text-sm text-slate-700">{r.organization?.organizationName ?? "—"}</span>
      ),
    },
    { header: "Tier", accessor: (r) => <StatusBadge status={r.tier} showDot={false} /> },
    { header: "Specialization", accessor: "specialization", className: "hidden lg:table-cell" },
    {
      header: "Experience",
      accessor: (r) => (
        <span className="text-xs">
          {r.experienceYears} yr{r.experienceYears !== 1 ? "s" : ""}
        </span>
      ),
      className: "hidden xl:table-cell",
    },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditors"
        description="Manage registered auditors across all accredited organizations"
        action={
          <Button onClick={openCreate} className="bg-[#0F2942] hover:bg-[#1a446c] text-white gap-2">
            <Plus className="h-4 w-4" /> Add Auditor
          </Button>
        }
      />

      <DataTable
        data={auditors}
        columns={columns}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by name, email, specialization…"
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={setPage}
        total={pagination?.total}
        emptyTitle="No auditors found"
        emptyDescription="Register your first auditor to an accredited organization."
        headerSlot={
          <Select
            value={tierFilter}
            onValueChange={(v) => {
              setTierFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-32 text-xs h-9 bg-white border-slate-200">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tiers</SelectItem>
              <SelectItem value="ASSOCIATE">Associate</SelectItem>
              <SelectItem value="SENIOR">Senior</SelectItem>
              <SelectItem value="LEAD">Lead</SelectItem>
            </SelectContent>
          </Select>
        }
        actions={(a) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => openEdit(a)}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteTarget(a)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Auditor" : "Add New Auditor"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
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
                <Label>Full Name *</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Specialization *</Label>
                <Input
                  value={form.specialization}
                  onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tier</Label>
                <Select
                  value={form.tier}
                  onValueChange={(v: any) => setForm((f) => ({ ...f, tier: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSOCIATE">Associate</SelectItem>
                    <SelectItem value="SENIOR">Senior</SelectItem>
                    <SelectItem value="LEAD">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.experienceYears}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, experienceYears: Number(e.target.value) }))
                  }
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#0F2942] hover:bg-[#1a446c] text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving…"
                  : editTarget
                    ? "Save Changes"
                    : "Create Auditor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Auditor"
        description={`This will permanently delete "${deleteTarget?.fullName}". This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
