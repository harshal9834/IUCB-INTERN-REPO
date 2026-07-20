import React, { useState } from "react";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { LocationSelector } from "../components/ui/LocationSelector";
import { 
  Building2, Globe, Phone, Mail, CheckCircle, Clock, ArrowLeft, 
  Pencil, Calendar, Activity, MapPin, ToggleLeft, Save, X
} from "lucide-react";
import { PageHeader } from "../components/reusable-components";
import { StatusBadge } from "../components/status-badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ConfirmDialog } from "../components/confirm-dialog";
import trainingInstitutesApi from "../services/api/training-institutes.api";

export const Route = createFileRoute("/admin/training-institutes/$id")({
  component: TrainingInstituteDetailsComponent,
});

function TrainingInstituteDetailsComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const { register, control, formState: { errors }, watch, setValue, getValues, reset } = useForm<any>();
  const [statusDialog, setStatusDialog] = useState<string | null>(null);

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
    mutationFn: (status: string) => trainingInstitutesApi.updateTrainingInstituteStatus(id, status),
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
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!institute) {
    return <div>Training Institute not found.</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
        <button 
          onClick={() => navigate({ to: "/admin/training-institutes" })}
          className="flex items-center hover:text-[#0F2942] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Institutes
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{institute.instituteName}</h1>
          <div className="flex items-center gap-3 mt-2 text-slate-500">
            <span className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">
              {institute.registrationNumber}
            </span>
            <StatusBadge status={institute.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" className="gap-2" onClick={handleEditClick}>
                <Pencil className="w-4 h-4" /> Edit Profile
              </Button>
              {institute.status === "ACTIVE" ? (
                <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => setStatusDialog("SUSPENDED")}>
                  <Clock className="w-4 h-4 mr-2" /> Suspend
                </Button>
              ) : (
                <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => setStatusDialog("ACTIVE")}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Activate
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave} className="bg-[#0F2942] text-white" disabled={updateMutation.isPending}>
                <Save className="w-4 h-4 mr-2" /> {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Institute Information</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="md:col-span-2 space-y-4">
                    <LocationSelector control={control} register={register} errors={errors} watch={watch} setValue={setValue} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1.5"><Mail className="w-4 h-4"/> Email</p>
                    <p className="font-medium">{institute.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1.5"><Phone className="w-4 h-4"/> Phone</p>
                    <p className="font-medium">{institute.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1.5"><Globe className="w-4 h-4"/> Website</p>
                    <p className="font-medium text-blue-600 hover:underline">
                      <a href={institute.website} target="_blank" rel="noreferrer">{institute.website || "N/A"}</a>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1.5"><MapPin className="w-4 h-4"/> Location</p>
                    <p className="font-medium">{institute.address}, {institute.country}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authorized Standards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">ISO 9001:2015</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">ISO 27001:2022</span>
                <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-sm font-medium border border-slate-200 border-dashed">+ Add Standard</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-slate-400" /> Recent Activity</CardTitle>
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
      </div>

      <ConfirmDialog
        open={!!statusDialog}
        onOpenChange={() => setStatusDialog(null)}
        title={statusDialog === "ACTIVE" ? "Activate Training Institute" : "Suspend Training Institute"}
        description={`Are you sure you want to ${statusDialog === "ACTIVE" ? "activate" : "suspend"} this training institute?`}
        confirmLabel={statusDialog === "ACTIVE" ? "Activate" : "Suspend"}
        variant={statusDialog === "ACTIVE" ? "default" : "destructive"}
        onConfirm={() => statusMutation.mutate(statusDialog!)}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
}
