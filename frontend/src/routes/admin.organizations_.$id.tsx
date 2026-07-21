import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { LocationSelector } from "../components/LocationSelector";
import { 
  Building2, Globe, Phone, Mail, FileText, CheckCircle, Clock, Save, X, Pencil, ShieldAlert, XCircle 
} from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ConfirmDialog } from "../components/confirm-dialog";
import organizationsApi from "../services/api/organizations.api";
import {
  DetailLayout,
  DetailContent,
  ProfileHeader,
  SectionCard,
  DataField,
  DataGrid,
  StatusPanel,
  QuickActionsPanel,
  LocationSection
} from "../components/admin-details";

export const Route = createFileRoute("/admin/organizations_/$id")({
  component: OrganizationDetailsComponent,
});

function OrganizationDetailsComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm();
  
  const [statusDialog, setStatusDialog] = useState<{ status: string; reason: string } | null>(null);

  const { data: organization, isLoading } = useQuery({
    queryKey: ["organization", id],
    queryFn: async () => {
      const res = await organizationsApi.getOrganizationById(id);
      return res.data.data.organization;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => organizationsApi.updateOrganization(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", id] });
      setIsEditing(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (data: { status: string; reason?: string }) => 
      organizationsApi.updateOrganizationStatus(id, data.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization", id] });
      setStatusDialog(null);
    },
  });

  const handleEditClick = () => {
    reset({
      organizationName: organization.organizationName,
      registrationNumber: organization.registrationNumber,
      country: organization.country,
      countryCode: organization.countryCode || "",
      phoneCode: organization.phoneCode || "",
      state: organization.state || "",
      city: organization.city || "",
      postalCode: organization.postalCode || "",
      addressLine1: organization.addressLine1 || "",
      addressLine2: organization.addressLine2 || "",
      email: organization.email,
      phone: organization.phone,
      website: organization.website ?? "",
      accreditationStatus: organization.accreditationStatus,
      accreditationDate: organization.accreditationDate?.split("T")[0] ?? "",
      expiryDate: organization.expiryDate?.split("T")[0] ?? "",
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

  if (!organization) {
    return <div>Organization not found.</div>;
  }

  const avatarText = organization.organizationName?.substring(0, 2).toUpperCase() || "OR";
  const address = [
    organization.addressLine1, 
    organization.addressLine2, 
    organization.city, 
    organization.state, 
    organization.postalCode, 
    organization.country
  ].filter(Boolean).join(", ");
  
  const fb = (val: any) => val || "Not Provided";

  return (
    <DetailLayout backTo="/admin/organizations" backLabel="Back to Organizations">
      <ProfileHeader
        name={organization.organizationName}
        avatarText={avatarText}
        status={organization.accreditationStatus}
        subtitle={
          <>
            <Building2 className="w-4 h-4 text-slate-400" /> Certification Body
          </>
        }
        metadata={{
          id: organization.registrationNumber,
          email: organization.email,
          phone: organization.phone,
          country: organization.country,
          joinedDate: new Date(organization.createdAt).toLocaleDateString(),
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
            {/* SECTION 1: Basic Information */}
            <SectionCard title="Basic Information" icon={<Building2 className="w-5 h-5 text-slate-400" />}>
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label>Organization Name</Label>
                      <Input {...register("organizationName")} />
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
                  <DataField label="Organization Name" value={organization.organizationName} />
                  <DataField label="Registration Number" value={organization.registrationNumber} />
                  <DataField label="Organization Type" value="Certification Body" />
                  <DataField label="Email Address" value={organization.email} />
                  <DataField label="Phone Number" value={organization.phone} />
                  <DataField label="Website">
                    {organization.website ? (
                      <a href={organization.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        {organization.website} <Globe className="w-3 h-3" />
                      </a>
                    ) : "N/A"}
                  </DataField>
                  <LocationSection location={organization} />
                </DataGrid>
              )}
            </SectionCard>

            {/* SECTION 2: Accreditation Details */}
            <SectionCard title="Accreditation Details" icon={<FileText className="w-5 h-5 text-slate-400" />}>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label>Accreditation Date</Label>
                    <Input type="date" {...register("accreditationDate")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Expiry Date</Label>
                    <Input type="date" {...register("expiryDate")} />
                  </div>
                </div>
              ) : (
                <DataGrid>
                  <DataField label="Accreditation Standard" value="ISO 17021" />
                  <DataField label="Accreditation Date" value={organization.accreditationDate ? new Date(organization.accreditationDate).toLocaleDateString() : "N/A"} />
                  <DataField label="Expiry Date" value={organization.expiryDate ? new Date(organization.expiryDate).toLocaleDateString() : "N/A"} />
                </DataGrid>
              )}
            </SectionCard>
          </>
        }
        right={
          <>
            <StatusPanel 
              memberStatus={organization.accreditationStatus} 
              profileCompletion={100}
            />
            <QuickActionsPanel 
              status={organization.accreditationStatus}
              onEditClick={handleEditClick}
              onStatusChange={(status) => setStatusDialog({ status, reason: "" })}
            />
          </>
        }
      />

      <ConfirmDialog
        open={!!statusDialog}
        onOpenChange={() => setStatusDialog(null)}
        title={`${statusDialog?.status === "SUSPENDED" ? "Suspend" : statusDialog?.status === "INACTIVE" ? "Deactivate" : "Activate"} Organization`}
        description={`Are you sure you want to ${statusDialog?.status === "SUSPENDED" ? "suspend" : statusDialog?.status === "INACTIVE" ? "deactivate" : "activate"} this organization?`}
        confirmLabel={statusDialog?.status === "SUSPENDED" ? "Suspend" : statusDialog?.status === "INACTIVE" ? "Deactivate" : "Activate"}
        variant={statusDialog?.status === "ACTIVE" ? "default" : "destructive"}
        onConfirm={() => statusMutation.mutate({ status: statusDialog!.status, reason: statusDialog!.reason })}
        isLoading={statusMutation.isPending}
      />
    </DetailLayout>
  );
}
