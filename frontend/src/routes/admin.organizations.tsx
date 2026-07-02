import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Pencil, Trash2, ToggleLeft } from "lucide-react";
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
import organizationsApi from "../services/api/organizations.api";

export const Route = createFileRoute("/admin/organizations")({
  component: OrganizationsComponent,
});

interface Organization {
  id: string;
  organizationName: string;
  registrationNumber: string;
  country: string;
  email: string;
  phone: string;
  website?: string | null;
  accreditationStatus: "ACTIVE" | "SUSPENDED" | "REVOKED";
  accreditationDate: string;
  expiryDate: string;
  createdAt: string;
}

interface OrgForm {
  organizationName: string;
  registrationNumber: string;
  country: string;
  address: string;
  email: string;
  phone: string;
  website: string;
  accreditationStatus: "ACTIVE" | "SUSPENDED" | "REVOKED";
  accreditationDate: string;
  expiryDate: string;
}

const defaultForm: OrgForm = {
  organizationName: "",
  registrationNumber: "",
  country: "",
  address: "",
  email: "",
  phone: "",
  website: "",
  accreditationStatus: "ACTIVE",
  accreditationDate: "",
  expiryDate: "",
};

function OrganizationsComponent() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Organization | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);
  const [statusTarget, setStatusTarget] = useState<{ org: Organization; newStatus: string } | null>(
    null,
  );
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");

  const queryKey = ["organizations", page, search, statusFilter];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await organizationsApi.getOrganizations(params);
      return res.data.data;
    },
    staleTime: 10_000,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => organizationsApi.createOrganization(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      closeModal();
    },
    onError: (err: any) =>
      setFormError(err?.response?.data?.message ?? "Failed to create organization"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      organizationsApi.updateOrganization(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      closeModal();
    },
    onError: (err: any) =>
      setFormError(err?.response?.data?.message ?? "Failed to update organization"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      organizationsApi.updateOrganizationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setStatusTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => organizationsApi.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setDeleteTarget(null);
    },
  });

  const openCreate = () => {
    setEditTarget(null);
    setForm(defaultForm);
    setFormError("");
    setModalOpen(true);
  };
  const openEdit = (org: Organization) => {
    setEditTarget(org);
    setForm({
      organizationName: org.organizationName,
      registrationNumber: org.registrationNumber,
      country: org.country,
      address: "",
      email: org.email,
      phone: org.phone,
      website: org.website ?? "",
      accreditationStatus: org.accreditationStatus,
      accreditationDate: org.accreditationDate?.split("T")[0] ?? "",
      expiryDate: org.expiryDate?.split("T")[0] ?? "",
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
    const payload = { ...form, website: form.website || null };
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns: DataTableColumn<Organization>[] = [
    {
      header: "Organization",
      accessor: (r) => (
        <div>
          <p className="font-semibold text-[#0F2942] text-sm">{r.organizationName}</p>
          <p className="text-xs text-slate-400 mt-0.5">{r.registrationNumber}</p>
        </div>
      ),
    },
    { header: "Country", accessor: "country" },
    { header: "Email", accessor: "email", className: "hidden lg:table-cell" },
    { header: "Status", accessor: (r) => <StatusBadge status={r.accreditationStatus} /> },
    {
      header: "Accreditation Date",
      accessor: (r) => (
        <span className="text-xs">{new Date(r.accreditationDate).toLocaleDateString()}</span>
      ),
      className: "hidden xl:table-cell",
    },
    {
      header: "Expiry",
      accessor: (r) => (
        <span
          className={`text-xs ${new Date(r.expiryDate) < new Date() ? "text-red-600 font-semibold" : "text-slate-600"}`}
        >
          {new Date(r.expiryDate).toLocaleDateString()}
        </span>
      ),
      className: "hidden xl:table-cell",
    },
  ];

  const organizations: Organization[] = data?.organizations ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        description="Manage accredited certification bodies and registrars"
        action={
          <Button onClick={openCreate} className="bg-[#0F2942] hover:bg-[#1a446c] text-white gap-2">
            <Plus className="h-4 w-4" /> Add Organization
          </Button>
        }
      />

      <DataTable
        data={organizations}
        columns={columns}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search by name, registration no., country…"
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={setPage}
        total={pagination?.total}
        emptyTitle="No organizations found"
        emptyDescription="Add your first accredited certification body to get started."
        headerSlot={
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-36 text-xs h-9 bg-white border-slate-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="REVOKED">Revoked</SelectItem>
            </SelectContent>
          </Select>
        }
        actions={(org) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => openEdit(org)}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setStatusTarget({
                    org,
                    newStatus: org.accreditationStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                  })
                }
              >
                <ToggleLeft className="mr-2 h-3.5 w-3.5" />
                {org.accreditationStatus === "ACTIVE" ? "Suspend" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteTarget(org)}
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Organization" : "Add New Organization"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input
                  id="orgName"
                  value={form.organizationName}
                  onChange={(e) => setForm((f) => ({ ...f, organizationName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="regNum">Registration Number *</Label>
                <Input
                  id="regNum"
                  value={form.registrationNumber}
                  onChange={(e) => setForm((f) => ({ ...f, registrationNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accDate">Accreditation Date *</Label>
                <Input
                  id="accDate"
                  type="date"
                  value={form.accreditationDate}
                  onChange={(e) => setForm((f) => ({ ...f, accreditationDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expDate">Expiry Date *</Label>
                <Input
                  id="expDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Accreditation Status</Label>
                <Select
                  value={form.accreditationStatus}
                  onValueChange={(v: any) => setForm((f) => ({ ...f, accreditationStatus: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="REVOKED">Revoked</SelectItem>
                  </SelectContent>
                </Select>
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
                    : "Create Organization"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirm */}
      <ConfirmDialog
        open={!!statusTarget}
        onOpenChange={() => setStatusTarget(null)}
        title={`${statusTarget?.newStatus === "SUSPENDED" ? "Suspend" : "Activate"} Organization`}
        description={`Are you sure you want to ${statusTarget?.newStatus === "SUSPENDED" ? "suspend" : "activate"} "${statusTarget?.org.organizationName}"?`}
        confirmLabel={statusTarget?.newStatus === "SUSPENDED" ? "Suspend" : "Activate"}
        variant={statusTarget?.newStatus === "SUSPENDED" ? "destructive" : "default"}
        onConfirm={() =>
          statusTarget &&
          statusMutation.mutate({ id: statusTarget.org.id, status: statusTarget.newStatus })
        }
        isLoading={statusMutation.isPending}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Organization"
        description={`This will permanently delete "${deleteTarget?.organizationName}" and all related data. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
