import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  UserCheck,
  GraduationCap,
  Users,
  Mail,
  Phone,
  Globe,
  Linkedin,
  MapPin,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  User,
  FileText,
  CalendarDays,
  StickyNote,
  Hash,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { StatusBadge } from "../components/status-badge";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import applicationsApi, { Application, ApplicationType } from "../services/api/applications.api";

export const Route = createFileRoute("/admin/applications_/$id")({
  component: ApplicationDetailComponent,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ApplicationType, { label: string; icon: any; color: string; bg: string; border: string }> = {
  ACCREDITATION: {
    label: "Accreditation Organization",
    icon: Building2,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  AUDITOR: {
    label: "Auditor",
    icon: UserCheck,
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  TRAINING_INSTITUTE: {
    label: "Training Institute",
    icon: GraduationCap,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  ADVISORY: {
    label: "Advisory Board",
    icon: Users,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
};

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-slate-800 mt-0.5 break-words">{value}</p>
      </div>
    </div>
  );
}

function TimelineStep({
  icon: Icon,
  title,
  subtitle,
  active,
  done,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          done
            ? "bg-green-100 text-green-600"
            : active
            ? "bg-[#0F2942] text-white"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="pt-1">
        <p className={`text-sm font-semibold ${done ? "text-green-700" : active ? "text-[#0F2942]" : "text-slate-400"}`}>
          {title}
        </p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

function ApplicationDetailComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [decisionType, setDecisionType] = useState<"approve" | "reject" | null>(null);
  const [remarks, setRemarks] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const res = await applicationsApi.getApplicationById(id);
      return (res as any).data.data.application as Application;
    },
    staleTime: 30_000,
  });

  const approveMutation = useMutation({
    mutationFn: () => applicationsApi.approveApplication(id, remarks || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setDecisionType(null);
      setRemarks("");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => applicationsApi.rejectApplication(id, remarks || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      setDecisionType(null);
      setRemarks("");
    },
  });

  const isPending = approveMutation.isPending || rejectMutation.isPending;

  const handleDecisionConfirm = () => {
    if (decisionType === "approve") approveMutation.mutate();
    else if (decisionType === "reject") rejectMutation.mutate();
  };

  const app = data;
  const typeCfg = app ? TYPE_CONFIG[app.applicationType] : null;
  const TypeIcon = typeCfg?.icon ?? FileText;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-2 text-slate-500 hover:text-[#0F2942] -ml-2"
        onClick={() => navigate({ to: "/admin/applications" })}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Applications
      </Button>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <XCircle className="h-12 w-12 text-red-400" />
          <p className="text-slate-600 font-semibold">Application not found</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {/* Content */}
      {app && typeCfg && (
        <>
          {/* Hero Header */}
          <div className={`rounded-xl border p-6 ${typeCfg.bg} ${typeCfg.border}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${typeCfg.bg} border ${typeCfg.border} shadow-sm`}>
                  <TypeIcon className={`h-7 w-7 ${typeCfg.color}`} />
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${typeCfg.color}`}>
                    {typeCfg.label} Application
                  </p>
                  <h1 className="text-xl font-bold text-[#0F2942]">{app.fullName}</h1>
                  {app.applicationNumber && (
                    <p className="text-xs font-mono text-slate-500 mt-1">{app.applicationNumber}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <StatusBadge status={app.applicationStatus} />
                <p className="text-xs text-slate-500">
                  Submitted {new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Main Details */}
            <div className="lg:col-span-2 space-y-5">

              {/* Applicant Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#0F2942]" /> Applicant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  <InfoRow icon={User} label="Full Name" value={app.fullName} />
                  <InfoRow icon={Mail} label="Email Address" value={app.email} />
                  <InfoRow icon={Phone} label="Phone Number" value={app.phone} />
                  <InfoRow icon={Linkedin} label="LinkedIn Profile" value={app.linkedinUrl} />
                  <InfoRow icon={Award} label="Designation" value={app.designation} />
                  <InfoRow icon={Clock} label="Years of Experience" value={app.experienceYears !== undefined ? `${app.experienceYears} years` : null} />
                </CardContent>
              </Card>

              {/* Organization Information */}
              {(app.company || app.registrationNumber || app.country) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#0F2942]" /> Organization Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    <InfoRow icon={Building2} label="Organization / Company" value={app.company} />
                    <InfoRow icon={Hash} label="Registration Number" value={app.registrationNumber} />
                    <InfoRow icon={MapPin} label="Country" value={app.country} />
                    <InfoRow icon={Globe} label="Website" value={app.website} />
                  </CardContent>
                </Card>
              )}

              {/* Applied Standard / Expertise */}
              {(app.appliedStandard || app.expertiseArea) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Award className="h-4 w-4 text-[#0F2942]" /> Applied Standard / Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0">
                    <InfoRow icon={Award} label="Applied Standard" value={app.appliedStandard} />
                    <InfoRow icon={Award} label="Expertise Area" value={app.expertiseArea} />
                  </CardContent>
                </Card>
              )}

              {/* Statement of Merit */}
              {app.statementOfMerit && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#0F2942]" /> Statement of Merit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-lg p-4 border border-slate-100">
                      {app.statementOfMerit}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Internal Notes */}
              {app.internalNotes && (
                <Card className="border-amber-200 bg-amber-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-amber-700 flex items-center gap-2">
                      <StickyNote className="h-4 w-4" /> Internal Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
                      {app.internalNotes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Timeline + Actions */}
            <div className="space-y-5">
              {/* Action Buttons */}
              {app.applicationStatus === "PENDING" && (
                <Card className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-700">Decision</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Review the application details carefully. Approving will automatically create the corresponding entity record.
                    </p>
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                      onClick={() => { setDecisionType("approve"); setRemarks(""); }}
                    >
                      <CheckCircle className="h-4 w-4" /> Approve Application
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50 gap-2"
                      onClick={() => { setDecisionType("reject"); setRemarks(""); }}
                    >
                      <XCircle className="h-4 w-4" /> Reject Application
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#0F2942]" /> Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TimelineStep
                    icon={FileText}
                    title="Application Submitted"
                    subtitle={new Date(app.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    done
                  />
                  <TimelineStep
                    icon={Clock}
                    title="Under Review"
                    subtitle="Admin review in progress"
                    done={app.applicationStatus !== "PENDING"}
                    active={app.applicationStatus === "PENDING"}
                  />
                  {app.applicationStatus === "APPROVED" && (
                    <TimelineStep
                      icon={CheckCircle}
                      title="Approved"
                      subtitle={app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : undefined}
                      done
                    />
                  )}
                  {app.applicationStatus === "REJECTED" && (
                    <TimelineStep
                      icon={XCircle}
                      title="Rejected"
                      subtitle={app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : undefined}
                      active
                    />
                  )}
                </CardContent>
              </Card>

              {/* Reviewed By */}
              {app.reviewedBy && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-700">Reviewed By</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0F2942] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {app.reviewedBy.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{app.reviewedBy.fullName}</p>
                        {app.reviewedBy.email && (
                          <p className="text-xs text-slate-400">{app.reviewedBy.email}</p>
                        )}
                      </div>
                    </div>
                    {app.reviewedAt && (
                      <p className="text-xs text-slate-400 mt-3">
                        On {new Date(app.reviewedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}

      {/* Decision Modal */}
      <Dialog open={!!decisionType} onOpenChange={() => setDecisionType(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={decisionType === "approve" ? "text-emerald-700" : "text-red-700"}>
              {decisionType === "approve" ? "✓ Approve Application" : "✗ Reject Application"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-slate-600">
              {decisionType === "approve"
                ? `Approving "${app?.fullName}" will automatically create the corresponding ${typeCfg?.label} record and send an approval email.`
                : `Rejecting "${app?.fullName}" will close this application and send a rejection email.`}
            </p>
            <div className="space-y-1.5">
              <Label>{decisionType === "approve" ? "Remarks (optional)" : "Rejection Reason (recommended)"}</Label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={
                  decisionType === "approve"
                    ? "Add internal notes about this approval…"
                    : "Provide a reason for rejection (will be sent to applicant)…"
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecisionType(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              className={
                decisionType === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
              onClick={handleDecisionConfirm}
              disabled={isPending}
            >
              {isPending
                ? "Processing…"
                : decisionType === "approve"
                ? "Confirm Approval"
                : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
