import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { LocationSelector } from "../components/LocationSelector";
import { Plus, MoreHorizontal, Pencil, Trash2, ToggleLeft, Eye, Building2, Globe, Phone, Mail, FileText, CheckCircle, Clock, XCircle, Filter } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import organizationsApi from "../services/api/organizations.api";
import dashboardApi from "../services/api/dashboard.api";

export const Route = createFileRoute("/admin/organizations")({
  component: OrganizationsComponent,
});

interface Organization {
  id: string;
  organizationName: string;
  registrationNumber: string;
  country: string;
  countryCode?: string;
  phoneCode?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  email: string;
  phone: string;
  website?: string | null;
  accreditationStatus: "ACTIVE" | "SUSPENDED" | "REVOKED";
  accreditationDate: string;
  expiryDate: string;
  createdAt: string;
  auditors?: any[];
  credentials?: any[];
}

interface OrgForm {
  organizationName: string;
  registrationNumber: string;
  country: string;
  countryCode?: string;
  phoneCode?: string;
  state: string;
  city: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
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
  countryCode: "",
  phoneCode: "",
  state: "",
  city: "",
  postalCode: "",
  addressLine1: "",
  addressLine2: "",
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
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [countryFilter, setCountryFilter] = useState<string>("ALL");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Organization | null>(null);
  
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);
  const [statusTarget, setStatusTarget] = useState<{ org: Organization; newStatus: string } | null>(null);
  
  const { register, control, handleSubmit: hookFormSubmit, reset, watch, setValue, formState: { errors } } = useForm<OrgForm>({ defaultValues: defaultForm });
  const [formError, setFormError] = useState("");

  const queryKey = ["organizations", page, limit, search, statusFilter, countryFilter];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (statusFilter !== "ALL") params.status = statusFilter;
      // Note: countryFilter needs to be handled by search or custom backend implementation if supported.
      if (countryFilter !== "ALL") params.search = (params.search ? params.search + " " : "") + countryFilter;
      const res = await organizationsApi.getOrganizations(params);
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

  const createMutation = useMutation({
    mutationFn: (payload: any) => organizationsApi.createOrganization(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      closeModal();
    },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? "Failed to create organization"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => organizationsApi.updateOrganization(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      closeModal();
    },
    onError: (err: any) => setFormError(err?.response?.data?.message ?? "Failed to update organization"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => organizationsApi.updateOrganizationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setStatusTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => organizationsApi.deleteOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setDeleteTarget(null);
    },
  });

  const navigate = Route.useNavigate();
  const openView = (org: Organization) => {
    navigate({ to: '/admin/organizations/$id' as any, params: { id: org.id } });
  };

  const openCreate = () => {
    setEditTarget(null);
    reset(defaultForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (org: Organization) => {
    setEditTarget(org);
    reset({
      organizationName: org.organizationName,
      registrationNumber: org.registrationNumber,
      country: org.country,
      countryCode: org.countryCode || "",
      phoneCode: org.phoneCode || "",
      state: org.state || "",
      city: org.city || "",
      postalCode: org.postalCode || "",
      addressLine1: org.addressLine1 || "",
      addressLine2: org.addressLine2 || "",
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

  const onFormSubmit = (data: OrgForm) => {
    setFormError("");
    
    const payload = { 
      organizationName: data.organizationName,
      registrationNumber: data.registrationNumber,
      country: data.country,
      countryCode: data.countryCode,
      phoneCode: data.phoneCode,
      state: data.state,
      city: data.city,
      postalCode: data.postalCode,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      email: data.email,
      phone: data.phone,
      website: data.website || null,
      accreditationStatus: data.accreditationStatus,
      accreditationDate: data.accreditationDate,
      expiryDate: data.expiryDate,
    };

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
    { header: "State", accessor: "state", className: "hidden lg:table-cell" },
    { header: "City", accessor: "city", className: "hidden lg:table-cell" },
    { header: "Email", accessor: "email", className: "hidden lg:table-cell" },
    { header: "Status", accessor: (r) => <StatusBadge status={r.accreditationStatus} /> },
    {
      header: "Accreditation Date",
      accessor: (r) => <span className="text-xs">{new Date(r.accreditationDate).toLocaleDateString()}</span>,
      className: "hidden xl:table-cell",
    },
    {
      header: "Expiry",
      accessor: (r) => (
        <span className={`text-xs ${new Date(r.expiryDate) < new Date() ? "text-red-600 font-semibold" : "text-slate-600"}`}>
          {new Date(r.expiryDate).toLocaleDateString()}
        </span>
      ),
      className: "hidden xl:table-cell",
    },
  ];

  const organizations: Organization[] = data?.organizations ?? [];
  const pagination = data?.pagination;

  // KPIs
  const orgTotal = metricsData?.organizations?.total ?? 0;
  const orgActive = metricsData?.organizations?.active ?? 0;
  const orgSuspended = orgTotal - orgActive; // Fallback math if specific counts aren't in metrics

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{orgTotal}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{orgActive}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{orgSuspended > 0 ? orgSuspended : 0}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revoked / Archived</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">0</div>}
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={organizations}
        columns={columns}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name, registration no., country…"
        page={page}
        totalPages={pagination?.totalPages ?? 1}
        onPageChange={setPage}
        total={pagination?.total}
        emptyTitle="No organizations found"
        emptyDescription="Add your first accredited certification body to get started."
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
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="REVOKED">Revoked</SelectItem>
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
        actions={(org) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => openView(org)}>
                <Eye className="mr-2 h-3.5 w-3.5" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEdit(org)}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusTarget({ org, newStatus: org.accreditationStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE" })}
              >
                <ToggleLeft className="mr-2 h-3.5 w-3.5" />
                {org.accreditationStatus === "ACTIVE" ? "Suspend" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDeleteTarget(org)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
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
          <form onSubmit={hookFormSubmit(onFormSubmit)} className="space-y-4 mt-2">
            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input id="orgName" {...register("organizationName")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="regNum">Registration Number *</Label>
                <Input id="regNum" {...register("registrationNumber")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register("email")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" {...register("phone")} required />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" {...register("website")} placeholder="https://" />
              </div>
              
              {/* Address Fields */}
              <div className="sm:col-span-2 space-y-4">
                <LocationSelector control={control} register={register} errors={errors} watch={watch} setValue={setValue} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="accDate">Accreditation Date *</Label>
                <Input id="accDate" type="date" {...register("accreditationDate")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expDate">Expiry Date *</Label>
                <Input id="expDate" type="date" {...register("expiryDate")} required />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Accreditation Status</Label>
                <Select value={watch("accreditationStatus")} onValueChange={(v: any) => setValue("accreditationStatus", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="REVOKED">Revoked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
              <Button type="submit" className="bg-[#0F2942] hover:bg-[#1a446c] text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving…" : editTarget ? "Save Changes" : "Create Organization"}
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
        onConfirm={() => statusTarget && statusMutation.mutate({ id: statusTarget.org.id, status: statusTarget.newStatus })}
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
