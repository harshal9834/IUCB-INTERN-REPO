import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Globe2,
  QrCode,
  User,
  XCircle,
  Activity,
} from "lucide-react";
import { verifyCertificate, type CertificateProfileResponse } from "../services/api/directory.api";

export const Route = createFileRoute("/verify")({
  component: VerifyPage,
  validateSearch: (search: Record<string, unknown>) => ({
    credential: (search.credential as string) ?? "",
  }),
});

function VerifyPage() {
  const { credential } = Route.useSearch();
  const [profile, setProfile] = useState<CertificateProfileResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!credential) return;
    setLoading(true);
    setError("");
    verifyCertificate(credential)
      .then((data) => setProfile(data))
      .catch((err: any) => {
        const status = err?.response?.status;
        setError(
          status === 404
            ? "Certificate Not Found"
            : err?.response?.data?.message || err?.message || "Verification failed.",
        );
      })
      .finally(() => setLoading(false));
  }, [credential]);

  // ── No credential in query string ─────────────────────────────────────────
  if (!credential) {
    return (
      <div className="min-h-screen bg-soft-gray flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-10 max-w-md w-full text-center">
          <XCircle className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy mb-2">No Credential Provided</h1>
          <p className="text-muted-foreground mb-6">
            Open a verification URL in the format:<br />
            <code className="text-sm bg-soft-gray px-2 py-1 rounded">/verify?credential=IUCB-...</code>
          </p>
          <Link
            to="/directory"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-soft-gray flex items-center justify-center">
        <div className="text-primary font-medium animate-pulse flex items-center gap-2">
          <Activity className="h-5 w-5 animate-spin" /> Verifying credential...
        </div>
      </div>
    );
  }

  // ── Error / Not Found ──────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-soft-gray flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-10 max-w-md w-full text-center">
          <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy mb-2">{error || "Certificate Not Found"}</h1>
          <p className="text-muted-foreground font-mono text-sm break-all mb-2">{credential}</p>
          <p className="text-muted-foreground mb-6">
            This certificate could not be verified in the IUCB registry.
          </p>
          <Link
            to="/directory"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  // ── Status helpers ─────────────────────────────────────────────────────────
  const rawStatus = profile.status.toUpperCase();
  const isActive = rawStatus === "ACTIVE" || rawStatus === "VALID";
  const statusClass = isActive
    ? "bg-green-100 text-green-700 border-green-200"
    : rawStatus === "REVOKED" || rawStatus === "EXPIRED"
    ? "bg-red-100 text-red-700 border-red-200"
    : rawStatus === "SUSPENDED"
    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
    : "bg-gray-100 text-gray-700 border-gray-200";

  const handleDownload = () =>
    window.open(`http://localhost:5000/api/v1/verify/download?credential=${encodeURIComponent(credential)}`, "_blank");
  const handleView = () =>
    window.open(`http://localhost:5000/api/v1/verify/view?credential=${encodeURIComponent(credential)}`, "_blank");

  return (
    <div className="min-h-screen bg-soft-gray py-10 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link
          to="/directory"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>

        <div className="bg-white rounded-2xl shadow-md border border-border overflow-hidden">

          {/* GREEN / RED HEADER */}
          <div className={`px-8 py-10 text-white text-center ${isActive ? "bg-green-600" : "bg-red-500"}`}>
            {isActive
              ? <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
              : <XCircle className="h-16 w-16 text-white mx-auto mb-4" />}
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {isActive ? "✓ VERIFIED CERTIFICATE" : "CERTIFICATE INVALID"}
            </h1>
            <p className={`text-lg font-medium ${isActive ? "text-green-100" : "text-red-100"}`}>
              {isActive
                ? "This credential is officially registered with IUCB."
                : "This certificate may have expired, been revoked, or suspended."}
            </p>
            <div className="mt-4">
              <span className={`inline-flex px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest border ${statusClass}`}>
                {rawStatus}
              </span>
            </div>
          </div>

          {/* TWO EQUAL CARDS */}
          <div className="p-8 lg:p-10 grid md:grid-cols-2 gap-8">

            {/* LEFT — Certificate Information */}
            <div className="rounded-xl border border-border p-6 space-y-5">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
                <FileText className="h-4 w-4" /> Certificate Information
              </h3>
              <InfoRow label="Certificate ID" value={profile.certificateId} mono />
              <InfoRow label="Credential ID" value={profile.credentialId} mono />
              <InfoRow label="Registration Number" value={profile.registrationNumber} mono />
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Issue Date" value={new Date(profile.issueDate).toLocaleDateString()} />
                <InfoRow label="Expiry Date" value={new Date(profile.expiryDate).toLocaleDateString()} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">Status</span>
                <span className={`inline-flex self-start px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide border ${statusClass}`}>
                  {rawStatus}
                </span>
              </div>
              {profile.verificationUrl && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-medium">Verification URL</span>
                  <a
                    href={profile.verificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-medium text-sm break-all hover:underline"
                  >
                    {profile.verificationUrl}
                  </a>
                </div>
              )}
            </div>

            {/* RIGHT — Holder Information */}
            <div className="rounded-xl border border-border p-6 space-y-5">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
                <User className="h-4 w-4" /> Holder Information
              </h3>
              <InfoRow label="Candidate Name" value={profile.candidateName || "—"} />
              <InfoRow label="Organization Name" value={profile.organizationName || profile.instituteName || "—"} />
              <InfoRow label="Organization Type" value={profile.category || "—"} />
              <InfoRow label="Standard" value={profile.standard || "—"} />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground font-medium">Country</span>
                <span className="text-navy font-semibold text-[15px] flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-muted-foreground" />
                  {profile.country || "Global / Verified"}
                </span>
              </div>
              {profile.qrCode && (
                <div className="pt-2 flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scan to Verify</span>
                  <img
                    src={profile.qrCode}
                    alt="Verification QR Code"
                    className="h-28 w-28 object-contain rounded border border-border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* CERTIFICATE ACTIONS — full width below */}
          <div className="px-8 lg:px-10 pb-10">
            <div className="rounded-xl border border-border p-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3 mb-5">
                <Activity className="h-4 w-4" /> Certificate Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleView}
                  disabled={!profile.hasPdf}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Eye className="h-4 w-4" /> View Certificate
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!profile.hasPdf}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" /> Download Certificate
                </button>
                {profile.qrCode && (
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border text-navy text-sm font-semibold hover:bg-soft-gray transition">
                    <QrCode className="h-4 w-4" /> Scan QR
                  </button>
                )}
              </div>
              {!profile.hasPdf && (
                <p className="mt-3 text-xs text-muted-foreground">Certificate PDF not yet generated.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <span className={`text-navy font-semibold text-[15px] ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
    </div>
  );
}
