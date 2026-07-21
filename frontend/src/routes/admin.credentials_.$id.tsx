import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  XCircle,
  AlertTriangle,
  Download,
  Mail,
  Eye,
  RefreshCw,
  Send,
  Clock,
} from "lucide-react";
import { PageHeader } from "../components/reusable-components";
import { StatusBadge } from "../components/status-badge";
import { LocationSection } from "../components/admin-details";
import { ConfirmDialog } from "../components/confirm-dialog";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import credentialsApi from "../services/api/credentials.api";

export const Route = createFileRoute("/admin/credentials_/$id")({
  component: CredentialDetailComponent,
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Toast component (lightweight, no library needed) ──────────────────────────
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-lg shadow-xl border text-sm font-medium transition-all animate-in slide-in-from-bottom-4 ${
        type === "success"
          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
          : "bg-red-50 text-red-800 border-red-200"
      }`}
    >
      {type === "success" ? (
        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
      )}
      {message}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

function CredentialDetailComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [sendAgainConfirmOpen, setSendAgainConfirmOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({
    recipientEmail: "",
    subject: "IUCB Accreditation Certificate",
    customMessage:
      "Dear Applicant,\n\nPlease find attached your IUCB Accreditation Certificate.\n\nBest regards,\nIUCB Admin Team",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") =>
    setToast({ message, type });

  const { data: credential, isLoading, error } = useQuery({
    queryKey: ["credential", id],
    queryFn: async () => {
      const res = await credentialsApi.getCredentialById(id);
      return res.data.data.credential;
    },
  });

  // Also fetch audit logs for the timeline
  const { data: auditLogsData } = useQuery({
    queryKey: ["credential-audit-logs", id],
    queryFn: async () => {
      const res = await credentialsApi.getCredentialAuditLogs(id);
      return res.data.data.auditLogs as Array<{
        id: string;
        action: string;
        timestamp: string;
        actor?: { fullName: string };
        newData?: any;
      }>;
    },
    enabled: !!credential,
  });

  const generateCertMutation = useMutation({
    mutationFn: () => credentialsApi.generateCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credential", id] });
      queryClient.invalidateQueries({ queryKey: ["credentials-issued"] });
      showToast("Certificate generated successfully.");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Failed to generate certificate.";
      showToast(msg, "error");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: () => credentialsApi.updateStatus(id, "REVOKED"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credential", id] });
      queryClient.invalidateQueries({ queryKey: ["credentials-issued"] });
      setRevokeConfirmOpen(false);
      showToast("Credential has been revoked.");
    },
  });

  const suspendMutation = useMutation({
    mutationFn: () => credentialsApi.updateStatus(id, "SUSPENDED"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credential", id] });
      queryClient.invalidateQueries({ queryKey: ["credentials-issued"] });
      setSuspendConfirmOpen(false);
      showToast("Credential has been suspended.");
    },
  });

  const sendEmailMutation = useMutation({
    mutationFn: (payload: typeof emailForm) =>
      credentialsApi.sendCertificateEmail(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credential", id] });
      queryClient.invalidateQueries({ queryKey: ["credential-audit-logs", id] });
      setEmailModalOpen(false);
      setSendAgainConfirmOpen(false);
      showToast("Certificate email sent successfully.");
    },
    onError: () => showToast("Failed to send certificate email.", "error"),
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading credential details...
      </div>
    );
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

  const emailSent: boolean = credential.emailSent ?? false;
  const emailSentAt: string | null = credential.emailSentAt ?? null;
  const emailSentBy: string | null = credential.emailSentBy ?? null;
  const recipientEmail =
    credential.application?.email ||
    credential.organization?.email ||
    credential.auditor?.email ||
    "";

  const openEmailModal = () => {
    setEmailForm((prev) => ({ ...prev, recipientEmail }));
    setEmailModalOpen(true);
  };

  const openSendAgainConfirm = () => {
    setEmailForm((prev) => ({ ...prev, recipientEmail }));
    setSendAgainConfirmOpen(true);
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
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      showToast("Failed to load certificate.", "error");
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
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      showToast("Failed to download certificate.", "error");
    }
  };

  // Build activity timeline items from audit logs
  const timelineItems: Array<{
    label: string;
    timestamp: string;
    by?: string;
    color: string;
  }> = [];

  if (credential.generatedAt) {
    timelineItems.push({
      label: "Certificate Generated",
      timestamp: credential.generatedAt,
      by: credential.generatedBy?.fullName || "System",
      color: "emerald",
    });
  }

  if (auditLogsData) {
    const emailLogs = auditLogsData.filter(
      (l) => l.action === "SEND_EMAIL" || l.action === "RESEND_EMAIL"
    );
    emailLogs.forEach((log) => {
      timelineItems.push({
        label:
          log.action === "RESEND_EMAIL"
            ? "Certificate Email Re-issued"
            : "Certificate Email Issued",
        timestamp: log.timestamp,
        by: log.actor?.fullName || "System",
        color: log.action === "RESEND_EMAIL" ? "blue" : "emerald",
      });
    });
  }

  timelineItems.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
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
        {/* ── Certificate Management ─────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[#0F2942] uppercase tracking-wider mb-4 border-b pb-2">
            Certificate Management
          </h3>

          {!credential.certificateGenerated ? (
            <div className="bg-slate-50 p-6 rounded-lg text-center border border-slate-200 border-dashed">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-800 mb-1">
                Status: Certificate Not Generated
              </p>
              <p className="text-sm text-slate-500 mb-4">
                Generate the certificate PDF to make it available for download
                and email distribution.
              </p>
              {displayStatus === "VALID" && (
                <Button
                  onClick={() => generateCertMutation.mutate()}
                  disabled={generateCertMutation.isPending}
                  className="bg-[#0F2942] hover:bg-[#1a446c] text-white"
                >
                  {generateCertMutation.isPending
                    ? "Generating..."
                    : "Generate Certificate"}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Certificate Generated card */}
              <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Certificate Generated</p>
                  <p className="text-xs opacity-80 mt-0.5">
                    {formatDateTime(credential.generatedAt)} by{" "}
                    {credential.generatedBy?.fullName || "System"}
                  </p>
                </div>
              </div>

              {/* Certificate Email Issued card */}
              {emailSent && (
                <div className="border border-emerald-100 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-800">
                    <Mail className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        Certificate Email Issued
                      </p>
                      <p className="text-xs opacity-75 mt-0.5">
                        Certificate email successfully delivered.
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-white border-t border-emerald-100 grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide font-medium mb-0.5">
                        Recipient
                      </p>
                      <p className="text-slate-700 font-medium">
                        {recipientEmail || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide font-medium mb-0.5">
                        Issued On
                      </p>
                      <p className="text-slate-700 font-medium">
                        {formatDateTime(emailSentAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-wide font-medium mb-0.5">
                        Issued By
                      </p>
                      <p className="text-slate-700 font-medium">
                        {emailSentBy || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3">
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

                {!emailSent ? (
                  /* First-time send */
                  <Button
                    onClick={openEmailModal}
                    className="gap-2 bg-[#10b981] hover:bg-[#059669] text-white"
                    disabled={sendEmailMutation.isPending}
                  >
                    {sendEmailMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" /> Send Email
                      </>
                    )}
                  </Button>
                ) : (
                  /* Already sent — show Issued badge + Send Again */
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold select-none">
                      <CheckCircle className="w-4 h-4" /> Issued
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openSendAgainConfirm}
                      disabled={sendEmailMutation.isPending}
                      className="gap-1.5 text-[#0F2942] border-[#0F2942] hover:bg-[#0F2942] hover:text-white"
                    >
                      {sendEmailMutation.isPending ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />{" "}
                          Sending…
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" /> Send Again
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Credential Information ─────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[#0F2942] uppercase tracking-wider mb-4 border-b pb-2">
            Credential Information
          </h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Credential ID</p>
              <p className="font-medium font-mono text-slate-800">
                {credential.credentialId}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Certificate ID</p>
              <p className="font-medium font-mono text-slate-800">
                {credential.certificateId || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Registration Number</p>
              <p className="font-medium font-mono text-slate-800">
                {credential.registrationNumber || "N/A"}
              </p>
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
              <p
                className={`font-medium ${
                  isExpired && credential.status === "VALID"
                    ? "text-red-600"
                    : "text-slate-800"
                }`}
              >
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

        {/* ── Activity Timeline ─────────────────────────────────────────── */}
        {timelineItems.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#0F2942] uppercase tracking-wider mb-4 border-b pb-2">
              Activity Timeline
            </h3>
            <ol className="relative border-l-2 border-slate-200 ml-3 space-y-0">
              {timelineItems.map((item, i) => (
                <li key={i} className="mb-6 ml-5">
                  <span
                    className={`absolute flex items-center justify-center w-7 h-7 rounded-full -left-3.5 ring-4 ring-white ${
                      item.color === "blue"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.label.includes("Generated") ? (
                      <FileText className="w-3.5 h-3.5" />
                    ) : item.label.includes("Re-issued") ? (
                      <RefreshCw className="w-3.5 h-3.5" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {item.label}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <time className="text-xs text-slate-500">
                      {formatDateTime(item.timestamp)}
                    </time>
                    {item.by && (
                      <span className="text-xs text-slate-400">
                        · by {item.by}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Organization & Applicant Information ──────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
          <h3 className="text-sm font-semibold text-[#0F2942] uppercase tracking-wider mb-4 border-b pb-2">
            Organization &amp; Applicant Information
          </h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Organization Name</p>
              <p className="font-medium text-slate-800">
                {credential.organization?.organizationName ||
                  credential.application?.company ||
                  "—"}
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
                {credential.application?.applicationType?.replace("_", " ") ||
                  "—"}
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
            <LocationSection location={credential} className="col-span-2 mt-2 pt-4" />
          </div>
        </div>

        {/* ── Auditor Information ────────────────────────────────────────── */}
        {credential.auditor && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
            <h3 className="text-sm font-semibold text-[#0F2942] uppercase tracking-wider mb-4 border-b pb-2">
              Auditor Information
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Assigned Auditor</p>
                <p className="font-medium text-slate-800">
                  {credential.auditor.fullName}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Auditor Email</p>
                <p className="font-medium text-slate-800">
                  {credential.auditor.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Send Email Modal (first send) ──────────────────────────────── */}
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
                onChange={(e) =>
                  setEmailForm({ ...emailForm, recipientEmail: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input
                value={emailForm.subject}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, subject: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Message Template</Label>
              <Textarea
                value={emailForm.customMessage}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, customMessage: e.target.value })
                }
                rows={6}
                required
              />
            </div>
            <div className="pt-1">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                The generated PDF certificate will be attached automatically.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEmailModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#10b981] hover:bg-[#059669] text-white"
                disabled={sendEmailMutation.isPending}
              >
                {sendEmailMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send Email"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Send Again Confirmation Modal ─────────────────────────────── */}
      <Dialog open={sendAgainConfirmOpen} onOpenChange={setSendAgainConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Resend Certificate Email?</DialogTitle>
            <DialogDescription className="text-slate-600 pt-1">
              This will send another copy of the certificate to the registered
              email address:
              <span className="block mt-1.5 font-semibold text-slate-800">
                {emailForm.recipientEmail || recipientEmail}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setSendAgainConfirmOpen(false)}
              disabled={sendEmailMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => sendEmailMutation.mutate(emailForm)}
              className="bg-[#0F2942] hover:bg-[#1a446c] text-white"
              disabled={sendEmailMutation.isPending}
            >
              {sendEmailMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Sending…
                </>
              ) : (
                "Send Again"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Revoke Confirm ────────────────────────────────────────────── */}
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

      {/* ── Suspend Confirm ───────────────────────────────────────────── */}
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
