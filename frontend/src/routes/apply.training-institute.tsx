import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { OFFICIAL_STANDARDS } from "../constants/standards";
import { GraduationCap, ArrowLeft, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import publicApplicationsApi from "../services/api/public-applications.api";
import { LocationSelector } from "../components/LocationSelector";

export const Route = createFileRoute("/apply/training-institute")({
  head: () => ({
    meta: [
      { title: "Become a Training Institute — IUCB" },
      {
        name: "description",
        content:
          "Apply to become an IUCB-recognized Training Institute. Accredit your courses and training programs.",
      },
    ],
  }),
  component: TrainingInstituteForm,
});

const schema = z.object({
  company: z.string().min(2, "Institute name is required"),
  organizationType: z.string().min(2, "Organization type is required"),
  country: z.string().min(2, "Country is required"),
  countryCode: z.string().min(2, "Country code is required"),
  phoneCode: z.string().optional(),
  state: z.string().min(2, "State/Province is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().optional(),
  addressLine1: z.string().min(5, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  address: z.string().optional(),
  website: z
    .string()
    .url("Please enter a valid URL (e.g. https://example.com)")
    .optional()
    .or(z.literal("")),
  fullName: z.string().min(2, "Contact person name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(5, "Phone number is required"),
  appliedStandard: z.string().min(2, "Training standard / program is required"),
  agreement: z.boolean().refine((v) => v === true, {
    message: "You must agree to the terms to submit",
  }),
});

type FormData = z.infer<typeof schema>;

const ORG_TYPES = [
  "Private Training Institute",
  "University / Higher Education",
  "Government Training Body",
  "Corporate Training Division",
  "Online Learning Platform",
  "Vocational Training Center",
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
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function TrainingInstituteForm() {
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

  const selectedStandardName = watch("appliedStandard");
  const selectedStandard = OFFICIAL_STANDARDS.find(s => s.name === selectedStandardName);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const { agreement: _, ...payload } = data;
      // Reconstruct address for fallback compatibility if needed
      const combinedAddress = [data.addressLine1, data.addressLine2, data.city, data.state, data.postalCode, data.country].filter(Boolean).join(", ");
      
      const res = await publicApplicationsApi.submitTrainingInstitute({
        ...payload,
        address: combinedAddress,
        website: payload.website || undefined,
      });
      const applicationNumber = res.data?.data?.application?.applicationNumber;
      navigate({
        to: "/apply/success",
        search: { applicationNumber, type: "training-institute" },
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-100 border border-pink-200 text-pink-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <GraduationCap className="h-3.5 w-3.5" /> Training Institute Application
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-navy">Become a Training Institute</h1>
          <p className="mt-2 text-muted-foreground text-sm md:text-base max-w-xl">
            Apply for IUCB recognition of your training programs and courses. All applications
            are reviewed by our accreditation committee.
          </p>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <strong>No documents required at this stage.</strong> Course materials and
            certifications will be requested by our team via official email after review.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            {/* Institute Info */}
            <div>
              <h2 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4 pb-2 border-b border-border">
                Institute Information
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Institute Name" error={errors.company?.message} required>
                    <input {...register("company")} placeholder="e.g. Global Skills Academy" className={inputClass} />
                  </Field>
                </div>
                <Field label="Organization Type" error={errors.organizationType?.message} required>
                  <select {...register("organizationType")} className={selectClass}>
                    <option value="">Select type…</option>
                    {ORG_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Website" error={errors.website?.message}>
                  <input {...register("website")} type="url" placeholder="https://yourinstitute.com" className={inputClass} />
                </Field>
                <div className="sm:col-span-2 mt-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4">Location Details</h3>
                  <LocationSelector
                    control={control}
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                  />
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div>
              <h2 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4 pb-2 border-b border-border">
                Contact Person
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Contact Person Name" error={errors.fullName?.message} required>
                    <input {...register("fullName")} placeholder="Full name of the contact" className={inputClass} />
                  </Field>
                </div>
                <Field label="Email Address" error={errors.email?.message} required>
                  <input {...register("email")} type="email" placeholder="contact@institute.com" className={inputClass} />
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
              </div>
            </div>

            {/* Training Details */}
            <div>
              <h2 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4 pb-2 border-b border-border">
                Training Details
              </h2>
              <Field label="Training Standards / Programs" error={errors.appliedStandard?.message} required>
                <select {...register("appliedStandard")} className={selectClass}>
                  <option value="">Select primary training standard…</option>
                  {OFFICIAL_STANDARDS.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
                {selectedStandard && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 space-y-1.5">
                    <div><strong className="text-slate-900">Edition:</strong> {selectedStandard.edition}</div>
                    <div><strong className="text-slate-900">Category:</strong> {selectedStandard.category}</div>
                    <div><strong className="text-slate-900">Governing Document:</strong> {selectedStandard.governingDocument}</div>
                  </div>
                )}
              </Field>
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
                  I confirm that the information provided is accurate. I agree to IUCB's{" "}
                  <Link to="/resources/governance" className="text-primary underline underline-offset-2">terms of service</Link>{" "}
                  and understand that false information may result in rejection.
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
          <a href="mailto:training@iucb.org" className="text-primary underline underline-offset-2">training@iucb.org</a>
        </p>
      </div>
    </div>
  );
}
