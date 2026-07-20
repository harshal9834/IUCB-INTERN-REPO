import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { LocationSelector } from "../components/LocationSelector";
import { 
  Building2, UserCheck, Briefcase, FileText, CheckCircle, Clock, Save, X, Pencil, ShieldAlert, XCircle, Award 
} from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ConfirmDialog } from "../components/confirm-dialog";
import auditorsApi from "../services/api/auditors.api";
import {
  DetailLayout,
  DetailContent,
  ProfileHeader,
  SectionCard,
  DataField,
  DataGrid,
  StatusPanel,
  QuickActionsPanel,
  ActivityLogPanel
} from "../components/admin-details";

export const Route = createFileRoute("/admin/auditors_/$id")({
  component: AuditorDetailsComponent,
});

function AuditorDetailsComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm();
  
  const [statusDialog, setStatusDialog] = useState<{ status: string; reason: string } | null>(null);

  const { data: auditor, isLoading } = useQuery({
    queryKey: ["auditor", id],
    queryFn: async () => {
      const res = await auditorsApi.getAuditorById(id);
      return res.data.data.auditor;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => auditorsApi.updateAuditor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditor", id] });
      setIsEditing(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (data: { status: string; reason?: string }) => 
      auditorsApi.updateAuditorStatus(id, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditor", id] });
      setStatusDialog(null);
    },
  });

  const handleEditClick = () => {
    reset({
      fullName: auditor.fullName,
      email: auditor.email,
      phone: auditor.phone,
      tier: auditor.tier,
      specialization: auditor.specialization,
      experienceYears: auditor.experienceYears,
      country: auditor.country,
      countryCode: auditor.countryCode || "",
      phoneCode: auditor.phoneCode || "",
      state: auditor.state || "",
      city: auditor.city || "",
      postalCode: auditor.postalCode || "",
      addressLine1: auditor.addressLine1 || "",
      addressLine2: auditor.addressLine2 || "",
    });
    setIsEditing(true);
  };

  const onSubmit = (data: any) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <Skeleton className="h-[300px] rounded-xl" />
            <Skeleton className="h-[300px] rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!auditor) {
    return <div>Auditor not found.</div>;
  }

  const avatarText = auditor.fullName?.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase() || "AU";
  const address = [
    auditor.addressLine1, 
    auditor.addressLine2, 
    auditor.city, 
    auditor.state, 
    auditor.postalCode, 
    auditor.country
  ].filter(Boolean).join(", ");
  
  const fb = (val: any) => val || "Not Provided";

  return (
    <DetailLayout backTo="/admin/auditors" backLabel="Back to Auditors">
      <ProfileHeader
        name={auditor.fullName}
        avatarText={avatarText}
        status={auditor.status}
        subtitle={
          <>
            <Award className="w-4 h-4 text-slate-400" /> {auditor.tier.replace('_', ' ')} Auditor
          </>
        }
        metadata={{
          id: auditor.id.substring(0, 8).toUpperCase(),
          email: auditor.email,
          phone: auditor.phone,
          country: auditor.country,
          joinedDate: new Date(auditor.createdAt).toLocaleDateString(),
        }}
        actions={{
          isEditing,
          onEditClick: handleEditClick,
          onCancelEdit: () => setIsEditing(false),
          onSave: handleSubmit(onSubmit),
          isSaving: updateMutation.isPending,
          onStatusChange: (status) => setStatusDialog({ status, reason: "" }),
        }}
      />

      <DetailContent 
        left={
          <>
            {/* SECTION 1: Personal Information */}
            <SectionCard title="Personal Information" icon={<UserCheck className="w-5 h-5 text-slate-400" />}>
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Full Name</Label>
                      <Input {...register("fullName")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input type="email" {...register("email")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input {...register("phone")} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-slate-900 mb-3 border-b border-slate-100 pb-2">Location Details</h3>
                    <LocationSelector 
                      control={control} 
                      register={register} 
                      errors={errors} 
                      watch={watch} 
                      setValue={setValue} 
                    />
                  </div>
                </div>
              ) : (
                <DataGrid>
                  <DataField label="Full Name" value={auditor.fullName} />
                  <DataField label="Email" value={auditor.email} />
                  <DataField label="Phone" value={auditor.phone} />
                  
                  <div className="md:col-span-3 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Location Information</h4>
                    <DataGrid>
                      <DataField label="Country" value={fb(auditor.country)} />
                      <DataField label="State / Province" value={fb(auditor.state)} />
                      <DataField label="City" value={fb(auditor.city)} />
                      <DataField label="Postal Code" value={fb(auditor.postalCode)} />
                      <DataField label="ISO Code" value={fb(auditor.countryCode)} />
                      <DataField label="Phone Code" value={fb(auditor.phoneCode)} />
                      <DataField label="Full Address" fullWidth value={fb(address)} />
                    </DataGrid>
                  </div>
                </DataGrid>
              )}
            </SectionCard>

            {/* SECTION 2: Professional Details */}
            <SectionCard title="Professional Details" icon={<Briefcase className="w-5 h-5 text-slate-400" />}>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label>Auditor Tier</Label>
                    <select
                      {...register("tier")}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                    >
                      <option value="PROVISIONAL_AUDITOR">Provisional Auditor</option>
                      <option value="INTERNAL_AUDITOR">Internal Auditor</option>
                      <option value="LEAD_AUDITOR">Lead Auditor</option>
                      <option value="PRINCIPAL_AUDITOR">Principal Auditor</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Specialization</Label>
                    <Input {...register("specialization")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Years of Experience</Label>
                    <Input type="number" {...register("experienceYears", { valueAsNumber: true })} />
                  </div>
                </div>
              ) : (
                <DataGrid>
                  <DataField label="Auditor Tier" value={auditor.tier.replace('_', ' ')} />
                  <DataField label="Specialization" value={auditor.specialization || "General"} />
                  <DataField label="Years of Experience" value={`${auditor.experienceYears || 0} Years`} />
                  {auditor.organization && (
                    <DataField label="Associated Organization" fullWidth>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-900">{auditor.organization.organizationName}</span>
                      </div>
                    </DataField>
                  )}
                </DataGrid>
              )}
            </SectionCard>
          </>
        }
        right={
          <>
            <StatusPanel 
              memberStatus={auditor.status} 
              profileCompletion={100}
            />
            <QuickActionsPanel 
              status={auditor.status}
              onEditClick={handleEditClick}
              onStatusChange={(status) => setStatusDialog({ status, reason: "" })}
            />
          </>
        }
      />

      <ConfirmDialog
        open={!!statusDialog}
        onOpenChange={() => setStatusDialog(null)}
        title={`${statusDialog?.status === "SUSPENDED" ? "Suspend" : statusDialog?.status === "INACTIVE" ? "Deactivate" : "Activate"} Auditor`}
        description={`Are you sure you want to ${statusDialog?.status === "SUSPENDED" ? "suspend" : statusDialog?.status === "INACTIVE" ? "deactivate" : "activate"} this auditor?`}
        confirmLabel={statusDialog?.status === "SUSPENDED" ? "Suspend" : statusDialog?.status === "INACTIVE" ? "Deactivate" : "Activate"}
        variant={statusDialog?.status === "ACTIVE" ? "default" : "destructive"}
        onConfirm={() => statusMutation.mutate({ status: statusDialog!.status, reason: statusDialog!.reason })}
        isLoading={statusMutation.isPending}
      />
    </DetailLayout>
  );
}
