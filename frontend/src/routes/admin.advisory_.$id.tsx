import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { LocationSelector } from "../components/LocationSelector";
import { 
  Building2, UserCheck, Briefcase, FileText, Send, Award, ExternalLink
} from "lucide-react";
import { StatusBadge } from "../components/status-badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ConfirmDialog } from "../components/confirm-dialog";
import { EmailComposerDialog } from "../components/email-composer-dialog";
import advisorsApi from "../services/api/advisors.api";
import {
  DetailLayout,
  DetailContent,
  ProfileHeader,
  SectionCard,
  DataField,
  DataGrid,
  StatusPanel,
  QuickActionsPanel,
  ActivityLogPanel,
  LocationSection
} from "../components/admin-details";

export const Route = createFileRoute("/admin/advisory_/$id")({
  component: AdvisoryBoardDetailsComponent,
});

function AdvisoryBoardDetailsComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      fullName: "",
      organization: "",
      designation: "",
      expertiseArea: "",
      experienceYears: 0,
      bio: "",
      linkedinUrl: "",
      country: "",
      countryCode: "",
      phoneCode: "",
      state: "",
      city: "",
      postalCode: "",
      addressLine1: "",
      addressLine2: "",
    }
  });
  const [statusDialog, setStatusDialog] = useState<{ status: string; reason: string } | null>(null);
  const [emailDialog, setEmailDialog] = useState(false);

  const { data: advisor, isLoading } = useQuery({
    queryKey: ["advisor", id],
    queryFn: async () => {
      const res = await advisorsApi.getAdvisorById(id);
      return res.data.data.advisor;
    },
  });

  const { data: auditLogsData } = useQuery({
    queryKey: ["advisor-audit-logs", id],
    queryFn: async () => {
      const res = await advisorsApi.getAdvisorAuditLogs(id);
      return res.data.data.auditLogs;
    },
  });

  const { data: emailLogsData } = useQuery({
    queryKey: ["advisor-email-logs", id],
    queryFn: async () => {
      const res = await advisorsApi.getAdvisorEmailLogs(id);
      return res.data.data.emailLogs;
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any) => advisorsApi.updateAdvisor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor", id] });
      setIsEditing(false);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (data: { status: string; reason?: string }) => 
      advisorsApi.updateAdvisorStatus(id, data.status, data.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor", id] });
      queryClient.invalidateQueries({ queryKey: ["advisor-audit-logs", id] });
      queryClient.invalidateQueries({ queryKey: ["advisor-email-logs", id] });
      setStatusDialog(null);
    },
  });

  const emailMutation = useMutation({
    mutationFn: (data: { recipient: string; subject: string; message: string }) =>
      advisorsApi.sendEmail(id, data.recipient, data.subject, data.message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-email-logs", id] });
      setEmailDialog(false);
    },
  });

  const handleEditClick = () => {
    reset({
      fullName: advisor.fullName || "",
      organization: advisor.organization || "",
      designation: advisor.designation || "",
      expertiseArea: advisor.expertiseArea || "",
      experienceYears: advisor.experienceYears || 0,
      bio: advisor.bio || "",
      linkedinUrl: advisor.linkedinUrl || "",
      country: advisor.country || "",
      countryCode: advisor.countryCode || "",
      phoneCode: advisor.phoneCode || "",
      state: advisor.state || "",
      city: advisor.city || "",
      postalCode: advisor.postalCode || "",
      addressLine1: advisor.addressLine1 || "",
      addressLine2: advisor.addressLine2 || "",
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
            <Skeleton className="h-[400px] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!advisor) {
    return <div>Advisory Board Member not found.</div>;
  }

  const app = advisor.application || {};
  const email = app.email || "N/A";
  const phone = app.phone || "N/A";

  const avatarText = advisor.fullName?.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase() || "AD";
  
  const address = [
    advisor.addressLine1, 
    advisor.addressLine2, 
    advisor.city, 
    advisor.state, 
    advisor.postalCode, 
    advisor.country
  ].filter(Boolean).join(", ");
  
  const fb = (val: any) => val || "Not Provided";

  return (
    <DetailLayout backTo="/admin/advisory" backLabel="Back to Advisory Board">
      <ProfileHeader
        name={advisor.fullName}
        avatarText={avatarText}
        status={advisor.status}
        subtitle={
          <>
            <Briefcase className="w-4 h-4 text-slate-400" /> {advisor.designation} at {advisor.organization}
          </>
        }
        metadata={{
          id: advisor.id.split('-')[0].toUpperCase(),
          email,
          phone,
          country: fb(advisor.country),
          joinedDate: new Date(advisor.createdAt).toLocaleDateString(),
          applicationId: app.id,
          applicationNumber: app.applicationNumber
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
                <>
                  <DataGrid>
                    <DataField label="Full Name" value={advisor.fullName} />
                    <DataField label="Email" value={email} />
                    <DataField label="Phone" value={phone} />
                  </DataGrid>
                  <LocationSection location={advisor} />
                </>
              )}
            </SectionCard>

            {/* SECTION 2: Professional Information */}
            <SectionCard title="Professional Information" icon={<Briefcase className="w-5 h-5 text-slate-400" />}>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label>Current Designation</Label>
                    <Input {...register("designation")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Organization</Label>
                    <Input {...register("organization")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Years of Experience</Label>
                    <Input type="number" {...register("experienceYears", { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Area of Expertise</Label>
                    <Input {...register("expertiseArea")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>LinkedIn Profile</Label>
                    <Input {...register("linkedinUrl")} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label>Professional Biography</Label>
                    <textarea 
                      className="w-full min-h-[120px] rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2942]"
                      {...register("bio")}
                      placeholder="Brief professional background..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <DataGrid>
                    <DataField label="Current Designation" value={advisor.designation} />
                    <DataField label="Organization" value={advisor.organization} />
                    <DataField label="Years of Experience" value={`${advisor.experienceYears} Years`} />
                    <DataField label="Industry" value="Education & Compliance" />
                    <DataField label="Area of Expertise" fullWidth value={advisor.expertiseArea} />
                    <DataField label="LinkedIn Profile" fullWidth>
                      <p className="font-medium text-blue-600 hover:underline">
                        {advisor.linkedinUrl ? (
                          <a href={advisor.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                            {advisor.linkedinUrl} <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : "N/A"}
                      </p>
                    </DataField>
                  </DataGrid>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Professional Biography</p>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {advisor.bio || "No biography provided."}
                    </p>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* SECTION 3: Application Information */}
            <SectionCard 
              title="Application Information" 
              icon={<FileText className="w-5 h-5 text-slate-400" />}
              action={app.id ? (
                <Button variant="link" className="text-blue-600 p-0 h-auto font-medium" onClick={() => navigate({ to: `/admin/applications/${app.id}` as any })}>
                  View Full Form <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              ) : undefined}
            >
              <DataGrid>
                <DataField label="Application ID">
                  <span className="font-medium text-slate-900 font-mono text-sm bg-slate-100 inline-block px-2 py-0.5 rounded">{app.applicationNumber || "N/A"}</span>
                </DataField>
                <DataField label="Application Type" value={app.applicationType || "ADVISORY"} />
                <DataField label="Application Status">
                  <StatusBadge status={app.applicationStatus || "APPROVED"} />
                </DataField>
                <DataField label="Submitted Date" value={app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"} />
                <DataField label="Approved Date" value={app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : new Date(advisor.createdAt).toLocaleDateString()} />
                <DataField label="Approved By" value="System Admin" />
                <DataField label="Approval Remarks" fullWidth value={app.internalNotes || "Application met all requirements and was automatically provisioned."} />
              </DataGrid>
            </SectionCard>
            
            <ActivityLogPanel logs={auditLogsData || []} />
          </>
        }
        right={
          <>
            <StatusPanel 
              memberStatus={advisor.status} 
              applicationStatus={app.applicationStatus || "APPROVED"}
              profileCompletion={95}
            />

            <QuickActionsPanel 
              status={advisor.status}
              onEditClick={handleEditClick}
              onStatusChange={(status) => setStatusDialog({ status, reason: "" })}
              onEmailClick={() => setEmailDialog(true)}
              applicationId={app.id}
            />

            {/* Email Panel */}
            <SectionCard title="Email Communications" icon={<Send className="w-5 h-5 text-slate-400" />}>
              <div className="space-y-4">
                <DataField label="Primary Email" value={<span className="truncate block" title={email}>{email}</span>} />
                {emailLogsData && emailLogsData.length > 0 && (
                  <>
                    <DataField label="Last Email Sent" value={`${new Date(emailLogsData[0].sentAt).toLocaleDateString()} at ${new Date(emailLogsData[0].sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`} />
                    <DataField label="Last Email Status" value={emailLogsData[0].status === 'SENT' ? 'Delivered' : 'Failed'} />
                    <DataField label="Total Emails Sent" value={emailLogsData.length} />
                    <DataField label="Latest Subject" value={emailLogsData[0].subject} />
                  </>
                )}
                {(!emailLogsData || emailLogsData.length === 0) && (
                  <p className="text-sm text-slate-500 py-2">No emails sent yet</p>
                )}
                <Button className="w-full bg-[#0F2942] hover:bg-[#1a446c] text-white shadow-sm mt-2" onClick={() => setEmailDialog(true)}>
                  <Send className="w-4 h-4 mr-2" /> Compose New Email
                </Button>
              </div>
            </SectionCard>
            
            {/* Future Ready Placeholder Spaces */}
            <div className="space-y-6 opacity-60">
              <Card className="border-dashed border-2 bg-slate-50/50">
                <CardContent className="p-6 text-center text-sm text-slate-500 font-medium">
                  <FileText className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  Documents Vault<br/><span className="text-xs font-normal">Coming Soon</span>
                </CardContent>
              </Card>
              <Card className="border-dashed border-2 bg-slate-50/50">
                <CardContent className="p-6 text-center text-sm text-slate-500 font-medium">
                  <Award className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                  Certificates<br/><span className="text-xs font-normal">Coming Soon</span>
                </CardContent>
              </Card>
            </div>
          </>
        }
      />

      <ConfirmDialog
        open={!!statusDialog}
        onOpenChange={() => setStatusDialog(null)}
        title={statusDialog?.status === "ACTIVE" ? "Activate Member" : statusDialog?.status === "INACTIVE" ? "Deactivate Member" : "Suspend Member"}
        description={
          <div className="space-y-3">
            <p>Are you sure you want to {statusDialog?.status === "ACTIVE" ? "activate" : statusDialog?.status === "INACTIVE" ? "deactivate" : "suspend"} this advisory board member?</p>
            {statusDialog?.status !== "ACTIVE" && (
              <div>
                <Label htmlFor="reason">Reason (Optional)</Label>
                <textarea
                  id="reason"
                  className="w-full min-h-[80px] rounded-md border border-slate-200 p-2 text-sm mt-1"
                  placeholder="Enter reason for status change..."
                  value={statusDialog?.reason || ""}
                  onChange={(e) => setStatusDialog({ ...statusDialog!, reason: e.target.value })}
                />
              </div>
            )}
          </div>
        }
        confirmLabel={statusDialog?.status === "ACTIVE" ? "Activate" : statusDialog?.status === "INACTIVE" ? "Deactivate" : "Suspend"}
        variant={statusDialog?.status === "ACTIVE" ? "default" : "destructive"}
        onConfirm={() => statusMutation.mutate({ status: statusDialog!.status, reason: statusDialog!.reason })}
        isLoading={statusMutation.isPending}
      />

      <EmailComposerDialog
        open={emailDialog}
        onOpenChange={setEmailDialog}
        recipientEmail={email}
        recipientName={advisor?.fullName || ""}
        onSend={(data) => emailMutation.mutate({ recipient: email, ...data })}
        isLoading={emailMutation.isPending}
      />
    </DetailLayout>
  );
}
