import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, FileText, XCircle, AlertTriangle, Download, Mail, Eye } from "lucide-react";
import { PageHeader } from "../components/reusable-components";
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
import { Textarea } from "../components/ui/textarea";
import credentialsApi from "../services/api/credentials.api";

export const Route = createFileRoute("/admin/credentials_/$id")({
  component: CredentialDetailComponent,
});

function CredentialDetailComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    recipientEmail: "",
    subject: "IUCB Accreditation Certificate",
    customMessage: "Dear Applicant,\n\nPlease find attached your IUCB Accreditation Certificate.\n\nBest regards,\nIUCB Admin Team",
  });

  const { data: credential, isLoading, error } = useQuery({
    queryKey: ["credential", id],
    queryFn: async () => {
      const res = await credentialsApi.getCredentialById(id);
      return res.data.data.credential;
    },
  });

  const generateCertMutation = useMutation({
    mutationFn: () => credentialsApi.generateCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credential", id] });
      queryClient.invalidateQueries({ queryKey: ["credentials-issued"] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: () => credentialsApi.updateStatus(id, "REVOKED"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credential", id] });
      queryClient.invalidateQueries({ queryKey: ["credentials-issued"] });
      setRevokeConfirmOpen(false);
    },
  });
  
  const suspendMutation = useMutation({
    mutationFn: () => credentialsApi.updateStatus(id, "SUSPENDED"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credential", id] });
      queryClient.invalidateQueries({ queryKey: ["credentials-issued"] });
      setSuspendConfirmOpen(false);
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: (payload: any) => credentialsApi.sendCertificateEmail(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credential", id] });
      setEmailModalOpen(false);
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading credential details...</div>;
  }

  if (error || !credential) {
    return (
      <div className="p-8 text-center text-red-500">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        Failed to load credential. It may have been deleted or doesn't exist.
      </div>
    );
  }

  const isExpired = new Date(credential.expiryDate) < new Date();
  let displayStatus = credential.status;
  if (displayStatus === "VALID" && isExpired) {
    displayStatus = "EXPIRED";
  }

  const openEmailModal = () => {
    const applicantEmail = credential.application?.email || credential.organization?.email || credential.auditor?.email || "";
    setEmailForm(prev => ({ ...prev, recipientEmail: applicantEmail }));
    setEmailModalOpen(true);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    sendEmailMutation.mutate(emailForm);
  };

  const handleViewCertificate = async () => {
    try {
      const response = await credentialsApi.downloadCertificate(credential.id, true);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      // Cleanup: revoke the blob URL after opening
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error("Error viewing certificate:", error);
      alert("Failed to load certificate. Please try again.");
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await credentialsApi.downloadCertificate(credential.id, false);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${credential.credentialId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Cleanup: revoke the blob URL after download
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("Failed to download certificate. Please try again.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate({ to: "/admin/credentials" })}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={`Credential ${credential.credentialId}`}
          description={`Standard: ${credential.standard}`}
          action={
            <div className="flex gap-2">
              {displayStatus === "VALID" && (
                <>
                  <Button
                    onClick={() => setSuspendConfirmOpen(true)}
                    variant="outline"
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Suspend
                  </Button>
                  <Button
                    onClick={() => setRevokeConfirmOpen(true)}
                    variant="destructive"
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" /> Revoke
                  </Button>
                </>
              )}
            </div>
          }
        />
      </div>

      <div className="space-y-6">
        {/* Certificate Management */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[#0F2942] uppercase tracking-wider mb-4 border-b pb-2">
            Certificate Management
          </h3>
          
          {!credential.certificateGenerated ? (
            <div className="bg-slate-50 p-6 rounded-lg text-center border border-slate-200 border-dashed">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-800 mb-1">Status: Certificate Not Generated</p>
              <p className="text-sm text-slate-500 mb-4">Generate the certificate PDF to make it available for download and email distribution.</p>
              {displayStatus === "VALID" && (
                <Button
                  onClick={() => generateCertMutation.mutate()}
                  disabled={generateCertMutation.isPending}
                  className="bg-[#0F2942] hover:bg-[#1a446c] text-white"
                >
                  {generateCertMutation.isPending ? "Generating..." : "Generate Certificate"}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Certificate Generated</p>
                  <p className="text-xs opacity-80 mt-0.5">
                    {new Date(credential.generatedAt!).toLocaleString()} by {credential.generatedBy?.fullName || "System"}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleViewCertificate}
                >
                  <Eye className="w-4 h-4" /> View Certificate
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleDownloadCertificate}
                >
                  <Download className="w-4 h-4" /> Download Certificate
                </Button>
                <Button
                  onClick={openEmailModal}
                  className="gap-2 bg-[#10b981] hover:bg-[#059669] text-white"
                >
                  <Mail className="w-4 h-4" /> Send Email
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Credential Information */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[#0F2942] uppercase tracking-wider mb-4 border-b pb-2">
            Credential Information
          </h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Credential ID</p>
              <p className="font-medium font-mono text-slate-800">{credential.credentialId}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Standard</p>
              <p className="font-medium text-slate-800">{credential.standard}</p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Issue Date</p>
              <p className="font-medium text-slate-800">
                {new Date(credential.issueDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Expiry Date</p>
              <p className={`font-medium ${isExpired && credential.status === "VALID" ? "text-red-600" : "text-slate-800"}`}>
                {new Date(credential.expiryDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Status</p>
              <StatusBadge status={displayStatus} />
            </div>
            <div>
              <p className="text-slate-500 mb-1">Verification URL</p>
              <a
                href={credential.verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-blue-600 hover:underline break-all"
              >
                {credential.verificationUrl}
              </a>
            </div>
          </div>
        </div>

        {/* Organization & Applicant Information */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[#0F2942] uppercase tracking-wider mb-4 border-b pb-2">
            Organization & Applicant Information
          </h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Organization Name</p>
              <p className="font-medium text-slate-800">
                {credential.organization?.organizationName || credential.application?.company || "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Applicant Name</p>
              <p className="font-medium text-slate-800">
                {credential.application?.fullName || "—"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Application Type</p>
              <p className="font-medium text-slate-800">
                {credential.application?.applicationType?.replace("_", " ") || "—"}
              </p>
            </div>
            {credential.application && (
              <div>
                <p className="text-slate-500 mb-1">Source Application</p>
                <p className="font-medium text-slate-800">
                  {credential.application.applicationNumber || "—"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Auditor Information */}
        {credential.auditor && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#0F2942] uppercase tracking-wider mb-4 border-b pb-2">
              Auditor Information
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Assigned Auditor</p>
                <p className="font-medium text-slate-800">{credential.auditor.fullName}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Auditor Email</p>
                <p className="font-medium text-slate-800">{credential.auditor.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Certificate Email</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendEmail} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Recipient Email</Label>
              <Input
                value={emailForm.recipientEmail}
                onChange={(e) => setEmailForm({ ...emailForm, recipientEmail: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Message Template</Label>
              <Textarea
                value={emailForm.customMessage}
                onChange={(e) => setEmailForm({ ...emailForm, customMessage: e.target.value })}
                rows={6}
                required
              />
            </div>
            <div className="pt-2">
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                The generated PDF certificate will be attached automatically.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEmailModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#10b981] hover:bg-[#059669] text-white"
                disabled={sendEmailMutation.isPending}
              >
                {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm */}
      <ConfirmDialog
        open={revokeConfirmOpen}
        onOpenChange={setRevokeConfirmOpen}
        title="Revoke Credential"
        description={`Revoking credential "${credential?.credentialId}" will immediately invalidate it. This action cannot be undone.`}
        confirmLabel="Revoke Credential"
        variant="destructive"
        onConfirm={() => revokeMutation.mutate()}
        isLoading={revokeMutation.isPending}
      />
      
      {/* Suspend Confirm */}
      <ConfirmDialog
        open={suspendConfirmOpen}
        onOpenChange={setSuspendConfirmOpen}
        title="Suspend Credential"
        description={`Suspending credential "${credential?.credentialId}" will temporarily mark it as inactive. It can be restored later.`}
        confirmLabel="Suspend Credential"
        variant="default"
        onConfirm={() => suspendMutation.mutate()}
        isLoading={suspendMutation.isPending}
      />
    </div>
  );
}
