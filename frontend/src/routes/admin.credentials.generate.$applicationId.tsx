import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  Award,
  FileText,
  User,
  Mail,
  Phone,
  Globe,
  Building2,
  Calendar,
  Shield,
  AlertCircle,
  Loader2,
  Hash,
  Tag,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { StatusBadge } from "../components/status-badge";
import credentialsApi from "../services/api/credentials.api";

export const Route = createFileRoute("/admin/credentials/generate/$applicationId")({
  component: GenerateCredentialPage,
});

// Map application types to display labels and auto-derived info
const TYPE_META: Record<string, { label: string; prefix: string; standard: string; color: string }> = {
  ACCREDITATION:      { label: "Organization Accreditation", prefix: "IUCB-ORG-XXXXXX", standard: "ISO/IEC 17021-1:2015",   color: "text-blue-700 bg-blue-50 border-blue-200" },
  AUDITOR:            { label: "Auditor Certification",      prefix: "IUCB-AUD-XXXXXX", standard: "ISO/IEC 17024:2012",      color: "text-violet-700 bg-violet-50 border-violet-200" },
  TRAINING_INSTITUTE: { label: "Training Institute",         prefix: "IUCB-TI-XXXXXX",  standard: "ISO 9001:2015",           color: "text-amber-700 bg-amber-50 border-amber-200" },
  ADVISORY:           { label: "Advisory Board Member",      prefix: "IUCB-ADV-XXXXXX", standard: "IUCB Advisory Board",     color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
};

function ReadOnlyField({ label, value, icon: Icon, mono = false }: { label: string; value?: string; icon?: any; mono?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </Label>
      <div className={`flex items-center px-3 py-2.5 rounded-md border border-slate-200 bg-slate-50 text-sm min-h-[40px] ${mono ? "font-mono" : ""} text-slate-700`}>
        {value || <span className="text-slate-400 italic">Not provided</span>}
      </div>
    </div>
  );
}

function GenerateCredentialPage() {
  const { applicationId } = Route.useParams();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const threeYearsLater = new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split("T")[0];

  const [issueDate, setIssueDate] = useState(today);
  const [expiryDate, setExpiryDate] = useState(threeYearsLater);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState<{ credentialId: string } | null>(null);

  // Fetch the full application details
  const { data: appData, isLoading: isLoadingApp, error: appError } = useQuery({
    queryKey: ["pending-app-detail", applicationId],
    queryFn: async () => {
      // Fetch all pending then find this one (reuse existing endpoint)
      const res = await credentialsApi.getPendingCredentials();
      const pending: any[] = res.data.data.pending;
      const found = pending.find((p: any) => p.id === applicationId);
      if (!found) throw new Error("Application not found or already processed");
      return found;
    },
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      credentialsApi.generateCredential({
        applicationId,
        issueDate,
        expiryDate,
      }),
    onSuccess: (response: any) => {
      const cred = response.data.data.credential;
      setSuccess({ credentialId: cred.credentialId });
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message ?? "Failed to generate credential. Please try again.");
    },
  });

  const app = appData;
  const typeMeta = app ? (TYPE_META[app.applicationType] ?? TYPE_META["ACCREDITATION"]) : null;

  // Derive organization/institute name field
  const orgName = app?.company || app?.organizationName || null;

  if (isLoadingApp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#0F2942]" />
        <p className="text-slate-500 font-medium">Fetching application data...</p>
      </div>
    );
  }

  if (appError || !app) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Application Not Found</h2>
        <p className="text-slate-500">
          This application may have already had a credential generated, or it does not exist in the pending queue.
        </p>
        <Button onClick={() => navigate({ to: "/admin/credentials/pending" })} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Pending
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-6">
        <div className="flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mx-auto border-4 border-emerald-200">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Credential Generated!</h2>
          <p className="text-slate-500 mt-2">The credential has been successfully created and saved.</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left space-y-3">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Credential ID</p>
            <p className="text-2xl font-mono font-bold text-[#0F2942]">{success.credentialId}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Applicant</p>
            <p className="font-semibold text-slate-900">{app.fullName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Issued</p>
            <p className="font-medium text-slate-700">{new Date(issueDate).toLocaleDateString()} → {new Date(expiryDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate({ to: "/admin/credentials/pending" })}>
            Back to Pending Queue
          </Button>
          <Button className="bg-[#0F2942] hover:bg-[#1a446c] text-white" onClick={() => navigate({ to: "/admin/credentials/generated" })}>
            View Generated Credentials
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <button
          onClick={() => navigate({ to: "/admin/credentials/pending" })}
          className="flex items-center gap-1.5 hover:text-[#0F2942] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Pending Credentials
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-semibold">Generate Credential</span>
      </div>

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-[#0F2942] rounded-lg">
              <Award className="w-5 h-5 text-[#D4AF37]" />
            </div>
            Generate Credential
          </h1>
          <p className="text-slate-500 mt-1 ml-14">
            Review the application details below. Only set the validity dates to complete.
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${typeMeta?.color}`}>
          {typeMeta?.label}
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* ===== SECTION 1: APPLICATION INFORMATION ===== */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="text-base text-[#0F2942] flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Section 1 — Application Information
            <span className="ml-auto text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Read-only</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <ReadOnlyField label="Application Number" value={app.applicationNumber} icon={Hash} mono />
            <ReadOnlyField
              label="Application Type"
              value={typeMeta?.label}
              icon={Tag}
            />
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider font-semibold text-slate-500">Application Status</Label>
              <div className="flex items-center px-3 py-2 rounded-md border border-slate-200 bg-slate-50 min-h-[40px]">
                <StatusBadge status={app.applicationStatus} />
              </div>
            </div>
            <ReadOnlyField label="Applicant Name" value={app.fullName} icon={User} />
            <ReadOnlyField label="Email Address" value={app.email} icon={Mail} />
            <ReadOnlyField label="Phone Number" value={app.phone} icon={Phone} />
            <ReadOnlyField label="Country" value={app.country} icon={Globe} />
            {orgName && (
              <ReadOnlyField label="Organization / Institute" value={orgName} icon={Building2} />
            )}
            <ReadOnlyField
              label="Submitted Date"
              value={new Date(app.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
              icon={Calendar}
            />
          </div>
        </CardContent>
      </Card>

      {/* ===== SECTION 2: CREDENTIAL INFORMATION ===== */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <CardTitle className="text-base text-[#0F2942] flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            Section 2 — Credential Information
            <span className="ml-auto text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Auto-generated</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-wider font-semibold text-slate-500 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> Credential ID
              </Label>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-dashed border-[#D4AF37] bg-amber-50 text-sm min-h-[40px]">
                <span className="font-mono font-bold text-[#0F2942] text-base">{typeMeta?.prefix}</span>
                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Auto-assigned on generation</span>
              </div>
            </div>
            <ReadOnlyField
              label="Standard / Protocol"
              value={typeMeta?.standard}
              icon={Award}
            />
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                <Shield className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <p className="font-semibold">Auto-determined from Application Type</p>
                  <p className="text-blue-700 text-xs mt-0.5">
                    The credential number format and applicable standard are automatically assigned based on the <strong>{typeMeta?.label}</strong> application type. No manual entry required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== SECTION 3: VALIDITY DATES ===== */}
      <Card className="shadow-sm border-[#D4AF37]/30">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-amber-50/60 to-slate-50 pb-4">
          <CardTitle className="text-base text-[#0F2942] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            Section 3 — Validity Period
            <span className="ml-auto text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">⚙ Admin Editable</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Issue Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={issueDate}
                min={today}
                onChange={(e) => setIssueDate(e.target.value)}
                className="border-slate-300 focus:border-[#0F2942] focus:ring-[#0F2942]"
                required
              />
              <p className="text-xs text-slate-400">The date from which the credential becomes valid.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Expiry Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={expiryDate}
                min={issueDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="border-slate-300 focus:border-[#0F2942] focus:ring-[#0F2942]"
                required
              />
              <p className="text-xs text-slate-400">Default: 3 years from today. Adjust as needed.</p>
            </div>
          </div>

          {/* Validity Summary */}
          {issueDate && expiryDate && (
            <div className="mt-5 flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-medium text-slate-800">
                  Credential will be valid for{" "}
                  <span className="text-[#0F2942] font-bold">
                    {Math.round(
                      (new Date(expiryDate).getTime() - new Date(issueDate).getTime()) /
                        (1000 * 60 * 60 * 24 * 365.25)
                    )}{" "}
                    year(s)
                  </span>
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  From {new Date(issueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} to{" "}
                  {new Date(expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== ACTION BUTTONS ===== */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <Button
          variant="outline"
          onClick={() => navigate({ to: "/admin/credentials/pending" })}
          disabled={generateMutation.isPending}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
        </Button>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm text-slate-500 hidden sm:block">
            <p className="font-medium text-slate-700">Ready to generate</p>
            <p className="text-xs">For: <strong>{app.fullName}</strong></p>
          </div>
          <Button
            onClick={() => {
              setErrorMsg("");
              if (!issueDate || !expiryDate) {
                setErrorMsg("Please set both Issue Date and Expiry Date.");
                return;
              }
              if (new Date(expiryDate) <= new Date(issueDate)) {
                setErrorMsg("Expiry Date must be after Issue Date.");
                return;
              }
              generateMutation.mutate();
            }}
            disabled={generateMutation.isPending}
            className="bg-[#0F2942] hover:bg-[#1a446c] text-white px-8 h-11 text-sm font-semibold shadow-sm"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Award className="w-4 h-4 mr-2" /> Generate Credential
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
