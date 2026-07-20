import React, { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { LocationSelector } from "../components/LocationSelector";
import { 
  Building2, Globe, Phone, Mail, CheckCircle, Clock, ArrowLeft, 
  Pencil, Activity, MapPin, Save, X, Briefcase, FileText, Send,
  UserCheck, ShieldAlert, Award, Calendar, ExternalLink, XCircle
} from "lucide-react";
import { StatusBadge } from "../components/status-badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ConfirmDialog } from "../components/confirm-dialog";
import { EmailComposerDialog } from "../components/email-composer-dialog";
import advisorsApi from "../services/api/advisors.api";

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
  const country = app.country || "N/A";
  const address = app.address || "N/A";

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      
      {/* Top Navigation */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <button 
          onClick={() => navigate({ to: "/admin/advisory" })}
          className="flex items-center hover:text-[#0F2942] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Advisory Board
        </button>
      </div>

      {/* HEADER SECTION (Enterprise Profile Header) */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="flex items-center justify-center h-24 w-24 bg-[#0F2942] text-white rounded-2xl text-3xl font-bold shadow-md border-4 border-white shrink-0">
              {advisor.fullName.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{advisor.fullName}</h1>
                <StatusBadge status={advisor.status} />
              </div>
              <p className="text-slate-600 font-medium text-lg flex items-center justify-center md:justify-start gap-2">
                <Briefcase className="w-4 h-4 text-slate-400" /> {advisor.designation} at {advisor.organization}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-500 mt-2">
                <span className="flex items-center gap-1.5"><UserCheck className="w-4 h-4" /> ID: {advisor.id.split('-')[0].toUpperCase()}</span>
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {email}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {phone}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {country}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined: {new Date(advisor.createdAt).toLocaleDateString()}</span>
                {app.applicationNumber && (
                  <Link to="/admin/applications/$id" params={{ id: app.id }} className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <FileText className="w-4 h-4" /> App: {app.applicationNumber}
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
            {!isEditing ? (
              <>
                <Button variant="outline" className="bg-white" onClick={handleEditClick}>
                  <Pencil className="w-4 h-4 mr-2" /> Edit Profile
                </Button>
                {advisor.status === "ACTIVE" ? (
                  <>
                    <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50 bg-white" onClick={() => setStatusDialog({ status: "SUSPENDED", reason: "" })}>
                      <ShieldAlert className="w-4 h-4 mr-2" /> Suspend
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-white" onClick={() => setStatusDialog({ status: "INACTIVE", reason: "" })}>
                      <XCircle className="w-4 h-4 mr-2" /> Deactivate
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 bg-white" onClick={() => setStatusDialog({ status: "ACTIVE", reason: "" })}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Activate
                  </Button>
                )}
                {app.id && (
                  <Button variant="default" className="bg-[#0F2942] text-white" onClick={() => navigate({ to: '/admin/applications/$id', params: { id: app.id } })}>
                    <FileText className="w-4 h-4 mr-2" /> View Original Application
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" className="bg-white" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button onClick={handleSubmit(onSubmit)} className="bg-[#0F2942] text-white" disabled={updateMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
          
        </div>
      </Card>

      {/* 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
        
        {/* LEFT COLUMN (70%) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* SECTION 1: Personal Information */}
          <Card>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg text-[#0F2942] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-slate-400" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Full Name</p>
                    <p className="font-medium text-slate-900">{advisor.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Email</p>
                    <p className="font-medium text-slate-900">{email}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Phone</p>
                    <p className="font-medium text-slate-900">{phone}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Country</p>
                    <p className="font-medium text-slate-900">{advisor.country || country}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">State / Province</p>
                    <p className="font-medium text-slate-900">{advisor.state || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">City</p>
                    <p className="font-medium text-slate-900">{advisor.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Postal Code</p>
                    <p className="font-medium text-slate-900">{advisor.postalCode || "N/A"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Address</p>
                    <p className="font-medium text-slate-900">
                      {[advisor.addressLine1, advisor.addressLine2].filter(Boolean).join(", ") || address}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 2: Professional Information */}
          <Card>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg text-[#0F2942] flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-slate-400" /> Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Current Designation</p>
                      <p className="font-medium text-slate-900">{advisor.designation}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Organization</p>
                      <p className="font-medium text-slate-900">{advisor.organization}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Years of Experience</p>
                      <p className="font-medium text-slate-900">{advisor.experienceYears} Years</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Industry</p>
                      <p className="font-medium text-slate-900">Education & Compliance</p> {/* Placeholder industry */}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Area of Expertise</p>
                      <p className="font-medium text-slate-900">{advisor.expertiseArea}</p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">LinkedIn Profile</p>
                      <p className="font-medium text-blue-600 hover:underline">
                        {advisor.linkedinUrl ? (
                          <a href={advisor.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1">
                            {advisor.linkedinUrl} <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Professional Biography</p>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {advisor.bio || "No biography provided."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 3: Application Information */}
          <Card>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-[#0F2942] flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" /> Application Information
              </CardTitle>
              {app.id && (
                <Link to="/admin/applications/$id" params={{ id: app.id }} className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
                  View Full Form <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Application ID</p>
                  <p className="font-medium text-slate-900 font-mono text-sm bg-slate-100 inline-block px-2 py-0.5 rounded">{app.applicationNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Application Type</p>
                  <p className="font-medium text-slate-900">{app.applicationType || "ADVISORY"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Application Status</p>
                  <StatusBadge status={app.applicationStatus || "APPROVED"} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Submitted Date</p>
                  <p className="font-medium text-slate-900">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Approved Date</p>
                  <p className="font-medium text-slate-900">{app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : new Date(advisor.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Approved By</p>
                  <p className="font-medium text-slate-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-emerald-600" /> System Admin
                  </p>
                </div>
                <div className="md:col-span-3 pt-4 border-t border-slate-100">
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Approval Remarks</p>
                  <p className="font-medium text-slate-900">{app.internalNotes || "Application met all requirements and was automatically provisioned."}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* BOTTOM SECTION: Recent Activity (from Audit Logs) */}
          <Card>
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-lg text-[#0F2942] flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-400" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 whitespace-nowrap">Date</th>
                      <th className="px-6 py-3 whitespace-nowrap">Action</th>
                      <th className="px-6 py-3 whitespace-nowrap">Performed By</th>
                      <th className="px-6 py-3 whitespace-nowrap w-full">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {auditLogsData && auditLogsData.length > 0 ? (
                      auditLogsData.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-md font-medium text-xs border ${
                              log.action.includes('CREATE') || log.action.includes('ACTIVE') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              log.action.includes('UPDATE') ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              log.action.includes('DELETE') || log.action.includes('INACTIVE') ? 'bg-red-50 text-red-700 border-red-100' :
                              log.action.includes('SUSPEND') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              'bg-slate-50 text-slate-700 border-slate-100'
                            }`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">
                            {log.admin?.fullName || 'System'}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            {log.newData?.reason || 'Automated action'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          No activity logs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN (30%) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Status Card */}
          <Card className="border-t-4 border-t-[#D4AF37]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#0F2942]">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-500">Member Status</span>
                  <StatusBadge status={advisor.status} />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-500">Application</span>
                  <StatusBadge status={app.applicationStatus || "APPROVED"} />
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm font-medium text-slate-500">Account Status</span>
                  <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Active</span>
                </div>
                <div className="py-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-500">Profile Completion</span>
                    <span className="text-sm font-bold text-[#0F2942]">95%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-[#D4AF37] h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#0F2942]">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-left font-medium" onClick={handleEditClick}>
                <Pencil className="w-4 h-4 mr-3 text-slate-400" /> Edit Profile
              </Button>
              {app.id && (
                <Button variant="outline" className="w-full justify-start text-left font-medium" onClick={() => navigate({ to: '/admin/applications/$id', params: { id: app.id } })}>
                  <FileText className="w-4 h-4 mr-3 text-slate-400" /> View Application
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start text-left font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200" onClick={() => setEmailDialog(true)}>
                <Send className="w-4 h-4 mr-3" /> Send Email
              </Button>
              {advisor.status === "ACTIVE" ? (
                <>
                  <Button variant="outline" className="w-full justify-start text-left font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200" onClick={() => setStatusDialog({ status: "SUSPENDED", reason: "" })}>
                    <ShieldAlert className="w-4 h-4 mr-3" /> Suspend
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => setStatusDialog({ status: "INACTIVE", reason: "" })}>
                    <XCircle className="w-4 h-4 mr-3" /> Deactivate
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="w-full justify-start text-left font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" onClick={() => setStatusDialog({ status: "ACTIVE", reason: "" })}>
                  <CheckCircle className="w-4 h-4 mr-3" /> Activate
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Email Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-[#0F2942]">Email Communications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Primary Email</p>
                  <p className="font-medium text-slate-900 text-sm truncate" title={email}>{email}</p>
                </div>
                {emailLogsData && emailLogsData.length > 0 && (
                  <>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Last Email Sent</p>
                      <p className="font-medium text-slate-900 text-sm">
                        {new Date(emailLogsData[0].sentAt).toLocaleDateString()} at {new Date(emailLogsData[0].sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Last Email Status</p>
                      <p className={`font-semibold text-sm flex items-center gap-1 ${emailLogsData[0].status === 'SENT' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {emailLogsData[0].status === 'SENT' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {emailLogsData[0].status === 'SENT' ? 'Delivered' : 'Failed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Total Emails Sent</p>
                      <p className="font-medium text-slate-900 text-sm">{emailLogsData.length}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Latest Subject</p>
                      <p className="font-medium text-slate-900 text-sm line-clamp-2">{emailLogsData[0].subject}</p>
                    </div>
                  </>
                )}
                {(!emailLogsData || emailLogsData.length === 0) && (
                  <p className="text-sm text-slate-500 py-2">No emails sent yet</p>
                )}
                <Button className="w-full bg-[#0F2942] hover:bg-[#1a446c] text-white shadow-sm mt-2" onClick={() => setEmailDialog(true)}>
                  <Send className="w-4 h-4 mr-2" /> Compose New Email
                </Button>
              </div>
            </CardContent>
          </Card>
          
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

        </div>
      </div>

      {/* Status Change Dialog with Reason */}
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

      {/* Email Composer Dialog */}
      <EmailComposerDialog
        open={emailDialog}
        onOpenChange={setEmailDialog}
        recipientEmail={email}
        recipientName={advisor?.fullName || ""}
        onSend={(data) => emailMutation.mutate({ recipient: email, ...data })}
        isLoading={emailMutation.isPending}
      />
    </div>
  );
}
