import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { LocationSelector } from "../components/LocationSelector";
import { 
  Building2, Globe, CheckCircle, Clock, Award
} from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ConfirmDialog } from "../components/confirm-dialog";
import trainingInstitutesApi from "../services/api/training-institutes.api";
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

export const Route = createFileRoute("/admin/training-institutes/$id")({
  component: TrainingInstituteDetailsComponent,
});

function TrainingInstituteDetailsComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const { register, control, watch, setValue, getValues, reset, formState: { errors } } = useForm<any>();
  const [statusDialog, setStatusDialog] = useState<{ status: string; reason: string } | null>(null);

  const { data: institute, isLoading } = useQuery({
    queryKey: ["training-institute", id],
    queryFn: async () => {
      const res = await trainingInstitutesApi.getTrainingInstituteById(id);
      return res.data.data.trainingInstitute;
    },
  });

  const { data: auditLogsData } = useQuery({
    queryKey: ["training-institute-audit-logs", id],
    queryFn: async () => {
      const res = await trainingInstitutesApi.getTrainingInstituteAuditLogs(id);
      return res.data.data.auditLogs;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => trainingInstitutesApi.updateTrainingInstitute(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-institute", id] });
      setIsEditing(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (data: { status: string; reason?: string }) => 
      trainingInstitutesApi.updateTrainingInstituteStatus(id, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-institute", id] });
      setStatusDialog(null);
    },
  });

  const handleEditClick = () => {
    reset({
      instituteName: institute.instituteName,
      registrationNumber: institute.registrationNumber,
      country: institute.country,
      countryCode: institute.countryCode || "",
      phoneCode: institute.phoneCode || "",
      state: institute.state || "",
      city: institute.city || "",
      postalCode: institute.postalCode || "",
      addressLine1: institute.addressLine1 || "",
      addressLine2: institute.addressLine2 || "",
      email: institute.email,
      phone: institute.phone,
      website: institute.website || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(getValues());
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
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!institute) {
    return <div>Training Institute not found.</div>;
  }

  const avatarText = institute.instituteName?.substring(0, 2).toUpperCase() || "TI";
  const address = [
    institute.addressLine1, 
    institute.addressLine2, 
    institute.city, 
    institute.state, 
    institute.postalCode, 
    institute.country
  ].filter(Boolean).join(", ");
  
  const fb = (val: any) => val || "Not Provided";

  return (
    <DetailLayout backTo="/admin/training-institutes" backLabel="Back to Institutes">
      <ProfileHeader
        name={institute.instituteName}
        avatarText={avatarText}
        status={institute.status}
        subtitle={
          <>
            <Building2 className="w-4 h-4 text-slate-400" /> Authorized Training Center
          </>
        }
        metadata={{
          id: institute.registrationNumber,
          email: institute.email,
          phone: institute.phone,
          country: institute.country,
          joinedDate: new Date(institute.createdAt).toLocaleDateString(),
        }}
        actions={{
          isEditing,
          onEditClick: handleEditClick,
          onCancelEdit: () => setIsEditing(false),
          onSave: handleSave,
          isSaving: updateMutation.isPending,
          onStatusChange: (status) => setStatusDialog({ status, reason: "" }),
        }}
      />

      <DetailContent 
        left={
          <>
            <SectionCard title="Institute Information" icon={<Building2 className="w-5 h-5 text-slate-400" />}>
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label>Institute Name</Label>
                      <Input {...register("instituteName")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Registration Number</Label>
                      <Input {...register("registrationNumber")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email Address</Label>
                      <Input type="email" {...register("email")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone Number</Label>
                      <Input {...register("phone")} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <Label>Website</Label>
                      <Input type="url" {...register("website")} />
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
                  <DataField label="Institute Name" value={institute.instituteName} />
                  <DataField label="Registration Number" value={institute.registrationNumber} />
                  <DataField label="Institute Type" value="Authorized Training Center" />
                  <DataField label="Email Address" value={institute.email} />
                  <DataField label="Phone Number" value={institute.phone} />
                  <DataField label="Website">
                    {institute.website ? (
                      <a href={institute.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        {institute.website} <Globe className="w-3 h-3" />
                      </a>
                    ) : "N/A"}
                  </DataField>
                  <div className="md:col-span-3 pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Location Information</h4>
                    <DataGrid>
                      <DataField label="Country" value={fb(institute.country)} />
                      <DataField label="State / Province" value={fb(institute.state)} />
                      <DataField label="City" value={fb(institute.city)} />
                      <DataField label="Postal Code" value={fb(institute.postalCode)} />
                      <DataField label="ISO Code" value={fb(institute.countryCode)} />
                      <DataField label="Phone Code" value={fb(institute.phoneCode)} />
                      <DataField label="Full Address" fullWidth value={fb(address)} />
                    </DataGrid>
                  </div>
                </DataGrid>
              )}
            </SectionCard>

            <SectionCard title="Authorized Standards" icon={<Award className="w-5 h-5 text-slate-400" />}>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">ISO 9001:2015</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">ISO 27001:2022</span>
                <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-sm font-medium border border-slate-200 border-dashed cursor-pointer hover:bg-slate-100">+ Add Standard</span>
              </div>
            </SectionCard>
          </>
        }
        right={
          <>
            <StatusPanel 
              memberStatus={institute.status} 
              profileCompletion={100}
            />
            <QuickActionsPanel 
              status={institute.status}
              onEditClick={handleEditClick}
              onStatusChange={(status) => setStatusDialog({ status, reason: "" })}
            />
            <ActivityLogPanel logs={auditLogsData || []} />
          </>
        }
      />

      <ConfirmDialog
        open={!!statusDialog}
        onOpenChange={() => setStatusDialog(null)}
        title={`${statusDialog?.status === "SUSPENDED" ? "Suspend" : statusDialog?.status === "INACTIVE" ? "Deactivate" : "Activate"} Training Institute`}
        description={`Are you sure you want to ${statusDialog?.status === "SUSPENDED" ? "suspend" : statusDialog?.status === "INACTIVE" ? "deactivate" : "activate"} this training institute?`}
        confirmLabel={statusDialog?.status === "SUSPENDED" ? "Suspend" : statusDialog?.status === "INACTIVE" ? "Deactivate" : "Activate"}
        variant={statusDialog?.status === "ACTIVE" ? "default" : "destructive"}
        onConfirm={() => statusMutation.mutate({ status: statusDialog!.status, reason: statusDialog!.reason })}
        isLoading={statusMutation.isPending}
      />
    </DetailLayout>
  );
}
