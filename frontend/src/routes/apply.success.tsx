import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { CheckCircle2, ArrowLeft, FileText, Clock, ChevronRight } from "lucide-react";

const successSearchSchema = z.object({
  applicationNumber: z.string().optional(),
  type: z.string().optional(),
});

export const Route = createFileRoute("/apply/success")({
  validateSearch: successSearchSchema,
  head: () => ({
    meta: [{ title: "Application Submitted — IUCB" }],
  }),
  component: SuccessPage,
});

const TYPE_LABELS: Record<string, string> = {
  accreditation: "Accreditation Application",
  auditor: "Auditor Application",
  "training-institute": "Training Institute Application",
  advisory: "Advisory Board Application",
};

const REVIEW_TIMELINES: Record<string, string> = {
  accreditation: "7–14 business days",
  auditor: "5–10 business days",
  "training-institute": "7–14 business days",
  advisory: "3–7 business days",
};

function SuccessPage() {
  const { applicationNumber, type } = useSearch({ from: "/apply/success" });
  const formType = type || "application";
  const label = TYPE_LABELS[formType] || "Application";
  const timeline = REVIEW_TIMELINES[formType] || "7–14 business days";

  return (
    <div className="min-h-screen bg-soft-gray" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b border-border py-4 px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-secondary transition">
          <span className="text-lg font-bold tracking-tight">IUCB</span>
        </Link>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-16">
        {/* Success Card */}
        <div className="bg-white rounded-2xl border border-border shadow-lg p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-semibold text-navy mb-2">
            Application Submitted Successfully
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Your {label} has been received and is now under review.
          </p>

          {/* Application Number */}
          {applicationNumber && (
            <div className="mt-8 rounded-xl border border-gold/40 bg-[#FFF9EC] p-5">
              <div className="text-[11px] uppercase tracking-widest text-[#8a6a00] mb-2 font-semibold">
                Application Reference Number
              </div>
              <div className="text-2xl font-mono font-bold text-primary tracking-wider">
                {applicationNumber}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Please save this number for future correspondence.
              </p>
            </div>
          )}

          {/* Status + Timeline */}
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-soft-gray border border-border p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-navy uppercase tracking-wider">Current Status</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                Pending Review
              </div>
            </div>
            <div className="rounded-xl bg-soft-gray border border-border p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-navy uppercase tracking-wider">Review Timeline</span>
              </div>
              <div className="text-sm font-medium text-slate-700">{timeline}</div>
              <div className="text-xs text-muted-foreground mt-0.5">From submission date</div>
            </div>
          </div>

          {/* What happens next */}
          <div className="mt-8 rounded-xl border border-border bg-soft-gray p-5 text-left">
            <h3 className="text-sm font-semibold text-navy mb-3">What happens next?</h3>
            <div className="space-y-3">
              {[
                "Our team will review your application and documentation.",
                "You may be contacted via email for any additional information.",
                "A decision notification will be sent to your registered email address.",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold grid place-items-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-border bg-white text-navy text-sm font-semibold hover:bg-soft-gray transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:brightness-105 transition"
            >
              Contact Support
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
