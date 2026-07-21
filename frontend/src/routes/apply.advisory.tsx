import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Briefcase, ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import publicApplicationsApi from "../services/api/public-applications.api";
import { LocationSelector } from "../components/LocationSelector";

export const Route = createFileRoute("/apply/advisory")({
  head: () => ({
    meta: [
      { title: "Join the Advisory Board — IUCB" },
      {
        name: "description",
        content:
          "Apply to join IUCB's Advisory Board. Share your expertise and help shape global accreditation standards.",
      },
    ],
  }),
  component: AdvisoryForm,
});

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(5, "Phone number is required"),
  country: z.string().min(2, "Country is required"),
  countryCode: z.string().min(2, "Country code is required"),
  phoneCode: z.string().optional(),
  state: z.string().min(2, "State/Province is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  address: z.string().optional(),
  designation: z.string().min(2, "Current designation is required"),
  company: z.string().min(2, "Organization is required"),
  experienceYears: z.coerce.number({ invalid_type_error: "Must be a number" }).int().min(0, "Cannot be negative"),
  linkedinUrl: z
    .string()
    .url("Please enter a valid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  expertiseArea: z.string().min(2, "Area of expertise is required"),
  statementOfMerit: z
    .string()
    .min(50, "Professional biography must be at least 50 characters"),
  agreement: z.boolean().refine((v) => v === true, {
    message: "You must agree to the terms to submit",
  }),
});

type FormData = z.infer<typeof schema>;

const EXPERTISE_AREAS = [
  "Information Security & Cybersecurity",
  "Data Privacy & Protection",
  "Governance, Risk & Compliance",
  "Quality Management Systems",
  "Environmental Management",
  "Occupational Health & Safety",
  "Accreditation & Certification Policy",
  "International Standards Development",
  "Technology & Digital Transformation",
  "Legal & Regulatory Affairs",
  "Finance & Audit",
  "Healthcare & Life Sciences",
  "Other",
];

const inputClass =
  "w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";
const selectClass =
  "w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none";

function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground mb-1.5">{hint}</p>}
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function AdvisoryForm() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agreement: false },
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      // Fix: we no longer drop phone and country from the payload
      const { agreement: _, ...payload } = data;
      const res = await publicApplicationsApi.submitAdvisory({
        ...payload,
        linkedinUrl: payload.linkedinUrl || undefined,
        experienceYears: Number(payload.experienceYears),
      });
      const applicationNumber = res.data?.data?.application?.applicationNumber;
      navigate({
        to: "/apply/success",
        search: { applicationNumber, type: "advisory" },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Submission failed. Please try again or contact support.";
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-soft-gray" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-tight text-primary">IUCB</Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <Briefcase className="h-3.5 w-3.5" /> Advisory Board Application
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-navy">Join the Advisory Board</h1>
          <p className="mt-2 text-muted-foreground text-sm md:text-base max-w-xl">
            IUCB's Advisory Board consists of distinguished professionals who help shape global
            accreditation policy. Share your expertise and be part of the conversation.
          </p>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>No documents required at this stage.</strong> Your LinkedIn profile and
            biography will serve as your initial application. Supporting documentation may be
            requested by email after review.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            {/* Personal Info */}
            <div>
              <h2 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4 pb-2 border-b border-border">
                Personal Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Full Name" error={errors.fullName?.message} required>
                    <input {...register("fullName")} placeholder="Your full name" className={inputClass} />
                  </Field>
                </div>
                <Field label="Email Address" error={errors.email?.message} required>
                  <input {...register("email")} type="email" placeholder="you@example.com" className={inputClass} />
                </Field>
                <Field label="Phone Number" error={errors.phone?.message} required>
                  <div className="flex gap-2">
                    <input
                      value={watch("phoneCode") || ""}
                      readOnly
                      placeholder="+1"
                      className="w-20 rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                    />
                    <input
                      {...register("phone")}
                      placeholder="234 567 8900"
                      className={inputClass}
                    />
                  </div>
                </Field>
                <div className="sm:col-span-2 mt-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Location Details</h3>
                  <LocationSelector
                    control={control}
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                    requireAddress={false}
                  />
                </div>
                <Field label="LinkedIn Profile URL" error={errors.linkedinUrl?.message}>
                  <input {...register("linkedinUrl")} type="url" placeholder="https://linkedin.com/in/yourprofile" className={inputClass} />
                </Field>
              </div>
            </div>

            {/* Professional Info */}
            <div>
              <h2 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4 pb-2 border-b border-border">
                Professional Background
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Current Designation" error={errors.designation?.message} required>
                  <input {...register("designation")} placeholder="e.g. Chief Information Security Officer" className={inputClass} />
                </Field>
                <Field label="Organization" error={errors.company?.message} required>
                  <input {...register("company")} placeholder="e.g. Acme Corporation" className={inputClass} />
                </Field>
                <Field label="Years of Experience" error={errors.experienceYears?.message} required>
                  <input {...register("experienceYears")} type="number" min={0} placeholder="e.g. 15" className={inputClass} />
                </Field>
                <Field label="Area of Expertise" error={errors.expertiseArea?.message} required>
                  <select {...register("expertiseArea")} className={selectClass}>
                    <option value="">Select primary domain…</option>
                    {EXPERTISE_AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field
                    label="Professional Biography"
                    error={errors.statementOfMerit?.message}
                    required
                    hint="Briefly describe your career, achievements, and why you want to join the IUCB Advisory Board (minimum 50 characters)."
                  >
                    <textarea
                      {...register("statementOfMerit")}
                      rows={5}
                      placeholder="Share your background, key achievements, and why you are interested in contributing to IUCB's advisory mission…"
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Agreement */}
            <div className="rounded-xl bg-soft-gray border border-border p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  {...register("agreement")}
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-600 leading-relaxed">
                  I confirm that the information provided is accurate and complete. I agree
                  to IUCB's{" "}
                  <Link to="/resources/governance" className="text-primary underline underline-offset-2">terms of service</Link>{" "}
                  and understand my responsibilities as an advisory board member.
                </span>
              </label>
              {errors.agreement && (
                <p className="mt-2 text-xs text-red-500 pl-7">{errors.agreement.message}</p>
              )}
            </div>

            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-white text-sm font-semibold hover:brightness-105 transition shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              ) : (
                <>Submit Application <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Questions?{" "}
          <Link to="/contact" className="text-primary underline underline-offset-2">Contact us</Link>{" "}
          or email{" "}
          <a href="mailto:advisory@iucb.org" className="text-primary underline underline-offset-2">advisory@iucb.org</a>
        </p>
      </div>
    </div>
  );
}
