import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck, BadgeCheck, Globe2, Users, Building2, GraduationCap, Search,
  ArrowRight, FileCheck2, Award, Lock, Scale, Eye, CheckCircle2, AlertTriangle,
  Briefcase, Cpu, HeartPulse, Banknote, Factory, Landmark, Quote, QrCode, Upload,
  Loader2, ChevronLeft, ChevronRight, Calendar, Camera
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import CountUp from "react-countup";
import { formatDistanceToNow, format } from "date-fns";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IUCB — The Global Authority for Accreditation & Certification" },
      { name: "description", content: "IUCB accredits Certification Bodies, Auditors and Training Providers against ISO, Cybersecurity & Privacy standards — recognized in 85+ countries." },
    ],
  }),
  component: Home,
});

/* ----------------------------- DATA ----------------------------- */

const slides = [
  {
    eyebrow: "Headquartered in Tallinn, Estonia · Serving 85+ Countries",
    title: "The Global Authority for Accreditation & Certification",
    accent: "Independent Oversight. Global Recognition.",
    body: "IUCB accredits Certification Bodies, Auditors, and Training Providers against ISO, Cybersecurity, and Privacy standards. We provide the independent oversight that organizations worldwide rely on to prove compliance and build institutional trust.",
    cta: { label: "Get Accredited", to: "/services" },
  },
  {
    eyebrow: "Certification Bodies",
    title: "Achieve International Accreditation",
    accent: "Competence. Consistency. Impartiality.",
    body: "IUCB accredits Certification Bodies to ensure they operate in accordance with internationally recognized standards, providing confidence that audits and certifications are competent, consistent, and impartial.",
    cta: { label: "Explore Accreditation", to: "/services" },
  },
  {
    eyebrow: "Instant Credential Verification",
    title: "Instant, Cryptographic Verification",
    accent: "Verify Every Credential with Confidence",
    body: "Trust requires transparency. Instantly validate the authenticity and current status of any IUCB-issued credential using our secure verification console. Verify by Credential ID, QR code, or camera scan in real time.",
    cta: { label: "Verify Authenticity", to: "/verify" },
  },
];

// staticStats with API keys for dynamic CountUp (completed-dash)
const staticStats = [
  { value: "500", suffix: "+", label: "Accredited Organizations", key: "organizations" },
  { value: "80", suffix: "+", label: "Signatory Nations", key: "countries" },
  { value: "2000", suffix: "+", label: "Certified Auditors", key: "auditors" },
  { value: "50", suffix: "+", label: "Standards Covered", key: "standards" },
];

const paths = [
  {
    icon: Building2,
    title: "Certification Bodies",
    desc: "Achieve formal recognition of competence to audit and certify organizations against international standards.",
    to: "/services",
  },
  {
    icon: Users,
    title: "Individual Auditors",
    desc: "Earn globally portable credentials that validate your expertise across technical and management systems.",
    to: "/services",
  },
  {
    icon: GraduationCap,
    title: "Training Providers",
    desc: "Accredit your courses and examination frameworks to ensure they meet rigorous international compliance standards.",
    to: "/services",
  },
  {
    icon: Search,
    title: "Verification Console",
    desc: "Instantly verify the authenticity and current status of any IUCB-issued credential.",
    to: "/verify",
  },
];

const problems = [
  {
    problem: "Organizations struggle with fragmented compliance and multiple accreditation requirements.",
    solution: "IUCB provides a unified, globally recognized accreditation framework covering ISO, Cybersecurity, and Privacy standards.",
  },
  {
    problem: "Employers and regulators need a trusted way to verify professional credentials.",
    solution: "Every IUCB credential can be instantly verified through our secure cryptographic verification system.",
  },
  {
    problem: "Training providers and certification bodies need international recognition and credibility.",
    solution: "IUCB accreditation demonstrates competence, impartiality, and compliance with internationally recognized standards.",
  },
];

const trust = [
  {
    icon: Globe2,
    title: "Global Recognition",
    desc: "Mutual Recognition Arrangements (MLA) across 85+ jurisdictions ensure your credentials are recognized worldwide.",
  },
  {
    icon: Scale,
    title: "Independent Evaluation",
    desc: "Impartial assessments governed by an Independent Oversight Council, completely separated from commercial auditing activities.",
  },
  {
    icon: Lock,
    title: "Tamper-Evident Security",
    desc: "Every credential is cryptographically signed and recorded on an immutable ledger to prevent fraud and ensure verification integrity.",
  },
  {
    icon: BadgeCheck,
    title: "ISO Alignment",
    desc: "Accreditation processes aligned with internationally recognized ISO and compliance standards.",
  },
  {
    icon: Eye,
    title: "Transparent Verification",
    desc: "Anyone can instantly verify the authenticity and current status of an IUCB-issued credential.",
  },
  {
    icon: Award,
    title: "Professional Excellence",
    desc: "Recognizing organizations and professionals who meet the highest international standards of competence and compliance.",
  },
];

const industries = [
  { icon: Building2, label: "Certification Bodies" },
  { icon: Users, label: "Individual Auditors" },
  { icon: GraduationCap, label: "Training Providers" },
  { icon: Landmark, label: "Government & Regulators" },
  { icon: Globe2, label: "International Organizations" },
  { icon: Briefcase, label: "Enterprise Organizations" },
];

/* ----------------------------- COMPONENT ----------------------------- */

function Home() {
  return (
    <>
      <HeroCarousel />
      <KpiStrip />
      <InstitutionalOverview />
      <AudiencePaths />
      <ProblemSolution />
      <SecureCredentialVerification />
      <TrustPillars />
      <IndustriesRow />
    </>
  );
}

/* ----------------------------- HERO CAROUSEL ----------------------------- */

function HeroCarousel() {
  const [i, setI] = useState(0);

  const { data: dynamicSlides, isLoading } = useQuery({
    queryKey: ["publicHeroSlides"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/v1/public/hero-slides");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const activeSlides = dynamicSlides && dynamicSlides.length > 0 
    ? dynamicSlides.map((s: any) => ({
        ...s,
        cta: { label: s.ctaLabel, to: s.ctaUrl }
      }))
    : slides;

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % activeSlides.length), 6500);
    return () => clearInterval(t);
  }, [activeSlides.length]);

  return (
    <section className="relative overflow-hidden flex items-center" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: "linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      <div className="absolute -top-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="w-full max-w-[1550px] mx-auto px-6 md:px-12 xl:px-20 relative pt-8 pb-16 md:pt-12 md:pb-24 lg:pt-12 lg:pb-28 grid lg:grid-cols-12 gap-12 lg:gap-20 xl:gap-28 items-start">
        {/* LEFT: cross-fade text */}
        <div className="lg:col-span-7 relative flex flex-col justify-center mt-2 lg:mt-4">
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-6 w-32 bg-primary/10 rounded-full mb-6"></div>
              <div className="h-12 w-3/4 bg-primary/10 rounded-lg mb-5"></div>
              <div className="h-6 w-1/2 bg-primary/10 rounded-lg mb-6"></div>
              <div className="h-6 w-full bg-primary/10 rounded mb-2"></div>
              <div className="h-6 w-full bg-primary/10 rounded mb-2"></div>
              <div className="h-6 w-2/3 bg-primary/10 rounded mb-8"></div>
              <div className="h-12 w-40 bg-gold/20 rounded-full"></div>
            </div>
          ) : (
            activeSlides.map((s: any, idx: number) => (
              <div
                key={s.title}
                className={`transition-all duration-700 ${idx === i ? "opacity-100 translate-y-0 relative" : "opacity-0 translate-y-3 absolute inset-0 pointer-events-none"}`}
              >
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-primary bg-white border border-gold/50 rounded-full px-3 py-1.5 shadow-sm" style={{ color: "#004B7A" }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {s.eyebrow}
                </div>
                <h1 className="mt-7 text-4xl md:text-5xl lg:text-[3.8rem] font-semibold leading-[1.08] tracking-tight max-w-[860px]" style={{ color: "#0F172A" }}>
                  {s.title}
                </h1>
                <div className="mt-5 text-lg md:text-xl font-semibold" style={{ color: "#D4AF37" }}>{s.accent}</div>
                <p className="mt-7 max-w-[800px] text-base md:text-[17px] leading-relaxed" style={{ color: "#475569" }}>
                  {s.body}
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-8">
                  <Link
                    to={s.cta.to as never}
                    className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-gold text-gold-foreground text-sm font-semibold hover:brightness-105 transition shadow-lg shadow-gold/30"
                  >
                    {s.cta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                  <div className="flex items-center gap-3 pl-2">
                    <div className="text-[1.7rem] font-semibold" style={{ color: "#D4AF37" }}>+95%</div>
                    <div className="text-xs leading-tight max-w-[120px] font-medium" style={{ color: "#64748B" }}>Audit Pass Rate</div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* tracking controls */}
          {!isLoading && (
            <div className="mt-16 flex items-center gap-5">
              <div className="flex items-center gap-2">
                {activeSlides.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setI(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all ${idx === i ? "w-8 bg-primary" : "w-2.5 border border-primary/30 bg-transparent hover:bg-primary/10"}`}
                  />
                ))}
              </div>
              <div className="h-5 w-px bg-primary/20" />
              <div className="flex items-center gap-1">
                <button onClick={() => setI((p) => (p - 1 + activeSlides.length) % activeSlides.length)} className="h-8 w-8 grid place-items-center rounded-full border border-primary/25 text-primary hover:bg-primary/5 transition" aria-label="Previous">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={() => setI((p) => (p + 1) % activeSlides.length)} className="h-8 w-8 grid place-items-center rounded-full border border-primary/25 text-primary hover:bg-primary/5 transition" aria-label="Next">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: visual composition */}
        <div className="lg:col-span-5 relative mt-4 lg:mt-8 xl:mt-10 flex flex-col justify-start">
          <div className="relative w-full max-w-[580px] h-[520px] ml-auto">
            {/* masked geometry */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-secondary/5 to-transparent blur-2xl" />
            <div className="absolute -top-4 -right-4 h-40 w-40 rounded-3xl border-2 border-gold/50 rotate-6" />
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-2xl bg-gold/20 -rotate-6" />

            {/* Main panel — dark navy card (completed-dash: new certificate visuals) */}
            <div
              className="relative h-full rounded-2xl overflow-hidden border border-white/10 text-white p-7 shadow-2xl shadow-primary/20 flex flex-col"
              style={{ background: "linear-gradient(135deg, #0F172A 0%, #004B7A 100%)" }}
            >
              {i === 0 && <CertificateInsights />}
              {i === 1 && <CertificateProfile />}
              {i === 2 && <CertificateSnapshot />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- CERTIFICATE VISUALS (completed-dash) ----------------------------- */

function CertificateInsights() {
  const { data, isLoading } = useQuery({
    queryKey: ["latestCertificateInsights"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/v1/public/certificate/latest/insights");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data;
    },
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col justify-between animate-pulse">
        <div className="flex items-center justify-between">
          <div className="text-[10px] tracking-[0.25em] uppercase text-white/70">Certificate Insights</div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="h-16 rounded-lg bg-white/5" />
          <div className="h-16 rounded-lg bg-white/5" />
          <div className="h-16 rounded-lg bg-white/5" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 bg-white/5 rounded-md w-full" />
          <div className="h-4 bg-white/5 rounded-md w-full" />
          <div className="h-4 bg-white/5 rounded-md w-full" />
        </div>
        <div className="mt-6 rounded-lg h-12 bg-white/5" />
      </div>
    );
  }

  if (!data) return <div className="h-full flex items-center justify-center text-white/50 text-xs">No insights available</div>;

  return (
    <div className="h-full flex flex-col justify-between overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <div className="flex shrink-0 items-center justify-between sticky top-0 z-10 pb-3 mb-2 border-b border-white/10">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Certificate Insights</h3>
        <div className="text-[10px] tracking-[0.25em] uppercase text-gold">Live</div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4 shrink-0">
        {[
          { k: format(new Date(data.issueDate), "dd MMM yy"), v: "Issue Date" },
          { k: format(new Date(data.expiryDate), "dd MMM yy"), v: "Expiry Date" },
          { k: data.verificationStatus, v: "Verification" },
        ].map((s) => (
          <div key={s.v} className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="text-sm font-semibold text-gold truncate" title={s.k}>{s.k}</div>
            <div className="text-[10px] text-white/65 mt-1 leading-tight">{s.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-3 shrink-0">
        {[
          { label: "Certificate Validity", val: data.validityPercentage },
          { label: "Verification Confidence", val: data.verificationConfidence },
          { label: "Digital Signature", val: data.digitalSignature ? 100 : 0, txt: data.digitalSignature ? "Verified" : "N/A" },
          { label: "QR Verification", val: data.qrVerified ? 100 : 0, txt: data.qrVerified ? "Verified" : "N/A" },
        ].map((w, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="text-[9px] w-[100px] text-white/60 uppercase tracking-wider leading-tight">{w.label}</div>
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary to-gold rounded-full transition-all duration-1000"
                style={{ width: `${w.val}%` }}
              />
            </div>
            <div className="text-[10px] w-12 text-white/70 text-right truncate">{w.txt ?? `${w.val}%`}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg bg-gold/10 border border-gold/30 p-3 text-[10px] text-white/80 shrink-0 leading-relaxed">
        <span className="font-semibold text-gold">Certificate Verification Notice:</span> This credential is currently {data.status} and recognized within the IUCB accreditation framework. All certificate information displayed is retrieved directly from the official database.
      </div>
    </div>
  );
}

function CertificateProfile() {
  const { data, isLoading } = useQuery({
    queryKey: ["latestCertificateInsights"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/v1/public/certificate/latest/insights");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data;
    },
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col animate-pulse">
        <div className="flex items-center justify-between">
          <div className="text-[10px] tracking-[0.25em] uppercase text-white/70">Certificate Profile</div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-16 rounded-lg bg-white/5" />
          <div className="h-16 rounded-lg bg-white/5" />
          <div className="h-16 rounded-lg bg-white/5" />
        </div>
      </div>
    );
  }

  if (!data) return <div className="h-full flex items-center justify-center text-white/50 text-xs">No profile available</div>;

  const tiers = [
    { t: "Certificate Type", v: data.certificateType, sub: "IUCB Certification", right: data.status, tone: "gold", icon: Award },
    { t: "Certificate Status", v: data.status, sub: "Verified Certificate", right: format(new Date(data.expiryDate), "dd MMM yyyy"), tone: "secondary", icon: CheckCircle2 },
    { t: "Certificate Template", v: data.templateName, sub: `Version ${data.templateVersion}`, right: "Published", tone: "muted", icon: FileCheck2 },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <div className="flex shrink-0 items-center justify-between sticky top-0 z-10 pb-3 mb-2 border-b border-white/10">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Certificate Profile</h3>
        <div className="text-[10px] tracking-[0.25em] uppercase text-gold">Active</div>
      </div>
      <div className="mt-4 space-y-3 shrink-0">
        {tiers.map((tier) => (
          <div key={tier.t} className="rounded-lg bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 w-[65%]">
                <div className={`h-9 w-9 shrink-0 rounded-full grid place-items-center ${tier.tone === "gold" ? "bg-gold/20 border border-gold/40 text-gold" : tier.tone === "secondary" ? "bg-secondary/30 border border-secondary/50 text-white" : "bg-white/10 border border-white/15 text-white/80"}`}>
                  <tier.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-white/60 uppercase tracking-wider">{tier.t}</div>
                  <div className="text-[11px] font-semibold text-white truncate pr-2" title={tier.v}>{tier.v}</div>
                  <div className="text-[9px] text-white/40 mt-0.5">{tier.sub}</div>
                </div>
              </div>
              <div className="text-right shrink-0 w-[30%]">
                <div className={`text-[10px] font-bold uppercase tracking-wider ${tier.tone === 'gold' ? 'text-gold' : 'text-white/80'}`}>{tier.right}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-4 grid grid-cols-2 gap-4 shrink-0">
        <div className="text-[10px] text-white/50 flex items-center justify-between border-t border-white/10 pt-3">
          <span>Downloads</span>
          <span className="text-white/80 font-medium">{data.downloads}</span>
        </div>
        {data.verificationCount !== undefined && (
          <div className="text-[10px] text-white/50 flex items-center justify-between border-t border-white/10 pt-3">
            <span>Verifications</span>
            <span className="text-white/80 font-medium">{data.verificationCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CertificateSnapshot() {
  const { data, isLoading } = useQuery({
    queryKey: ["latestCertificate"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/v1/public/certificate/latest/summary");
      if (!res.ok) throw new Error("Failed to fetch certificate");
      const json = await res.json();
      return json.data;
    },
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col animate-pulse">
        <div className="flex items-center justify-between">
          <div className="text-[10px] tracking-[0.25em] uppercase text-white/70">Certificate Status Overview</div>
          <div className="h-3 w-12 bg-white/20 rounded" />
        </div>
        <div className="mt-4 h-32 rounded-lg bg-white/5 border border-white/10" />
        <div className="mt-3 space-y-2">
          <div className="h-12 rounded-md bg-white/5" />
          <div className="h-12 rounded-md bg-white/5" />
        </div>
        <div className="mt-auto pt-3 grid grid-cols-2 gap-3">
          <div className="h-12 rounded-md bg-white/5" />
          <div className="h-12 rounded-md bg-white/5" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/50 text-xs">
        No recent certificates generated.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <div className="flex shrink-0 items-center justify-between sticky top-0 z-10 pb-3 mb-2 border-b border-white/10">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Certificate Status Overview</h3>
        <div className="inline-flex items-center gap-1 text-[10px] tracking-[0.25em] uppercase text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" /> Live
        </div>
      </div>

      {/* TOP STATUS CARD */}
      <div className="mt-2 rounded-lg bg-white/5 border border-white/10 p-4 shrink-0">
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <div className="col-span-2">
            <div className="text-[9px] uppercase tracking-wider text-white/50">Credential ID</div>
            <div className="text-[11px] font-mono text-gold/90 truncate">{data.credentialId}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/50">Certificate ID</div>
            <div className="text-[11px] font-mono text-white/90 truncate">{data.certificateId}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/50">Certificate Type</div>
            <div className="text-[11px] text-white/90 truncate">{data.certificateType}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/50">Issued On</div>
            <div className="text-[11px] text-white/90">{format(new Date(data.issuedOn), "dd MMM yyyy")}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/50">Valid Until</div>
            <div className="text-[11px] text-white/90">{format(new Date(data.expiryDate), "dd MMM yyyy")}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/50">Generated By</div>
            <div className="text-[11px] text-white/90 truncate">{data.generatedBy}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/50">Status</div>
            <div className="text-[11px] text-gold font-bold">{data.status}</div>
          </div>
        </div>
      </div>

      {/* CERTIFICATE SUMMARY */}
      <div className="mt-3 rounded-lg bg-white/5 border border-white/10 p-3 shrink-0 grid grid-cols-2 gap-2">
        <div>
          <div className="text-[9px] uppercase tracking-wider text-white/50">Verification Status</div>
          <div className="text-[10px] text-white/90">{data.verificationStatus}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-white/50">Template Used</div>
          <div className="text-[10px] text-white/90 truncate" title={data.templateName}>{data.templateName}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-white/50">Email Status</div>
          <div className="text-[10px] text-white/90">{data.emailStatus}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-wider text-white/50">Download Count</div>
          <div className="text-[10px] text-white/90">{data.downloadCount} Downloads</div>
        </div>
      </div>

      {/* RECENT CERTIFICATE EVENTS */}
      <div className="mt-3 shrink-0">
        <div className="text-[10px] uppercase tracking-wider text-white/70 mb-2">Recent Certificate Events</div>
        <div className="space-y-2">
          {data.activities.map((act: any, idx: number) => (
            <div
              key={idx}
              className="flex items-start justify-between rounded-md bg-white/[0.04] border border-white/10 px-3 py-2 text-[11px]"
            >
              <div>
                <div className="flex items-center gap-2 text-white/90">
                  <span className={`h-1.5 w-1.5 rounded-full ${idx === 0 ? "bg-gold" : "bg-secondary"}`} />
                  {act.eventName}
                </div>
                <div className="text-[9px] text-white/50 mt-0.5 ml-3.5">By {act.performedBy}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[9px] text-white/50">{formatDistanceToNow(new Date(act.timestamp))} ago</div>
                <div className="text-[8px] text-white/40 mt-0.5 uppercase tracking-wider">{act.referenceNumber}</div>
              </div>
            </div>
          ))}
          {data.activities.length === 0 && (
            <div className="text-[10px] text-white/50 italic py-2 text-center">No recent events</div>
          )}
        </div>
      </div>

      {/* STATUS PANELS */}
      <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 gap-3 shrink-0">
        <div className="rounded-md bg-gold/10 border border-gold/30 p-2.5 flex items-center justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/50">Digital Signature</div>
            <div className="text-[10px] text-gold mt-0.5">{data.digitalSignature ? "Available" : "Not Available"}</div>
          </div>
          <ShieldCheck className="h-5 w-5 text-gold opacity-80" />
        </div>
        <div className="rounded-md bg-secondary/15 border border-secondary/40 p-2.5 flex items-center justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-wider text-white/50">QR Verification</div>
            <div className="text-[10px] text-white/90 mt-0.5">{data.qrGenerated ? "Generated" : "Not Generated"}</div>
          </div>
          <QrCode className="h-5 w-5 text-white opacity-80" />
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- KPI STRIP ----------------------------- */

function KpiStrip() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["publicStatistics"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/v1/public/statistics");
      if (!res.ok) throw new Error("Failed to fetch statistics");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return (
    <section className="bg-white border-b border-border">
      <div className="container-x py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {staticStats.map((s) => {
          const apiValue = data ? data[s.key] : null;
          const displayValue = apiValue ?? 0;
          return (
            <div key={s.label} className="text-center md:text-left border-l-2 border-gold pl-4 md:pl-5">
              <div className="text-3xl md:text-[2.25rem] font-semibold text-gold tracking-tight leading-none">
                {isLoading ? (
                  <div className="h-10 w-24 bg-slate-200 animate-pulse rounded md:mx-0 mx-auto" />
                ) : (
                  <>
                    {isError || !apiValue ? (
                      "0+"
                    ) : (
                      <>
                        <CountUp start={0} end={displayValue} duration={1.5} separator="," />
                        +
                      </>
                    )}
                  </>
                )}
              </div>
              <div className="mt-2 text-[12px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ----------------------------- INSTITUTIONAL OVERVIEW ----------------------------- */

function InstitutionalOverview() {
  return (
    <section className="py-16 md:py-20 bg-soft-gray">
      <div className="container-x grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6">
          <div className="eyebrow">Global Validation Initiative</div>
          <h2 className="mt-3 text-3xl md:text-[2.6rem] font-semibold leading-[1.1] text-primary tracking-tight">
            Building institutional trust — one verified credential at a time.
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed max-w-xl">
            IUCB sits at the intersection of regulation, standards bodies, and industry — providing
            rigorous, independent accreditation that governments and enterprises rely on to make
            confident decisions.
          </p>
          <div className="mt-7 grid sm:grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, t: "ISO/IEC 17011 governed" },
              { icon: Globe2, t: "MLA across 85+ nations" },
              { icon: Scale, t: "Independent oversight council" },
              { icon: BadgeCheck, t: "Public outcome registry" },
            ].map((x) => (
              <div key={x.t} className="flex items-center gap-3 rounded-lg bg-white border border-border p-3.5">
                <div className="h-9 w-9 rounded-md bg-light-blue text-primary grid place-items-center">
                  <x.icon className="h-4.5 w-4.5" />
                </div>
                <div className="text-sm font-medium text-navy">{x.t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Image montage */}
        <div className="lg:col-span-6">
          <div className="relative h-[460px]">
            <MontagePanel className="absolute top-0 left-0 w-[60%] h-[58%]" tone="primary" Icon={Landmark} caption="HQ · Tallinn" />
            <MontagePanel className="absolute top-[8%] right-0 w-[44%] h-[40%]" tone="secondary" Icon={Globe2} caption="85+ Nations" />
            <MontagePanel className="absolute bottom-0 right-[8%] w-[58%] h-[52%]" tone="gold" Icon={ShieldCheck} caption="Accredited" />
            <MontagePanel className="absolute bottom-[12%] left-[6%] w-[34%] h-[34%]" tone="light" Icon={Users} caption="Auditors" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MontagePanel({
  className, tone, Icon, caption,
}: {
  className: string;
  tone: "primary" | "secondary" | "gold" | "light";
  Icon: typeof ShieldCheck;
  caption: string;
}) {
  const tones: Record<string, string> = {
    primary: "from-primary to-[#003a60] text-white",
    secondary: "from-secondary to-primary text-white",
    gold: "from-gold/90 to-[#a88828] text-gold-foreground",
    light: "from-light-blue to-white text-primary",
  };
  return (
    <div className={`${className} group`}>
      <div className="relative h-full rounded-2xl overflow-hidden border-2 border-gold/60 shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:scale-[1.04] group-hover:ring-2 group-hover:ring-gold/60">
        <div className={`absolute inset-0 bg-gradient-to-br ${tones[tone]}`} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        <div className="relative h-full flex flex-col justify-between p-5">
          <Icon className="h-8 w-8 opacity-90" />
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-80">IUCB</div>
            <div className="text-base font-semibold mt-0.5">{caption}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- AUDIENCE PATHS ----------------------------- */

function AudiencePaths() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container-x">
        <div className="max-w-2xl">
          <div className="eyebrow">How Can We Help You?</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            Choose your path to get started
          </h2>
          <p className="mt-4 text-muted-foreground">Tailored journeys for every stakeholder in the accreditation ecosystem.</p>
        </div>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {paths.map((p) => (
            <Link
              key={p.title}
              to={p.to as never}
              className="group relative rounded-2xl border border-border bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 text-gold-foreground grid place-items-center">
                <p.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-5 font-semibold text-navy text-[15px]">{p.title}</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-secondary group-hover:gap-2 transition-all">
                Get started <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- PROBLEM / SOLUTION ----------------------------- */

function ProblemSolution() {
  return (
    <section className="py-16 md:py-20 bg-soft-gray">
      <div className="container-x">
        <div className="max-w-2xl">
          <div className="eyebrow">The Solution Matrix</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            The Problem We <span className="text-secondary">Solve</span>
          </h2>
          <p className="mt-4 text-muted-foreground">Mapping common industry compliance failures against our platform capabilities.</p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <article key={i} className="rounded-2xl overflow-hidden border border-border bg-white shadow-sm hover:shadow-lg transition">
              <div className="bg-[#FFF7E6] border-b border-gold/20 p-5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#8a6a00]">
                  <AlertTriangle className="h-3.5 w-3.5" /> Problem 0{i + 1}
                </div>
                <p className="mt-3 text-sm font-medium text-navy leading-snug">{p.problem}</p>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-secondary mb-3">
                  <span className="h-5 w-5 rounded-full bg-gold/20 border border-gold/50 grid place-items-center">
                    <CheckCircle2 className="h-3 w-3 text-gold-foreground" />
                  </span>
                  IUCB Solution
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.solution}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- SECURE CREDENTIAL VERIFICATION ----------------------------- */

function SecureCredentialVerification() {
  return (
    <section className="py-16 md:py-20 bg-primary text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="container-x relative grid lg:grid-cols-2 gap-12 lg:gap-24 items-start pt-4">
        {/* Left Column */}
        <div className="max-w-[480px]">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-gold border border-gold/30 rounded-full px-3.5 py-1 bg-gold/5">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            SECURE CREDENTIAL VERIFICATION
          </div>
          <h2 className="mt-5 text-4xl md:text-5xl lg:text-[3.5rem] font-semibold leading-[1.05] tracking-tight">
            Instant, <span className="text-gold">Cryptographic</span> Verification
          </h2>
          <p className="mt-5 text-white/75 text-[17px] leading-relaxed max-w-[440px]">
            Trust requires transparency. The open verification console allows anyone — regulators, employers, or partners — to instantly validate the authenticity and current status of any IUCB issued credential.
          </p>
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-white/90">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span className="font-medium text-[15px]">Tamper-Proof Credentials</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <QrCode className="h-4 w-4 text-gold" />
              <span className="font-medium text-[15px]">QR Code Verification</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <CheckCircle2 className="h-4 w-4 text-gold" />
              <span className="font-medium text-[15px]">Real-Time Validation</span>
            </div>
          </div>
          <div className="mt-8">
            <Link
              to="/verify"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gold text-gold-foreground text-sm font-semibold hover:brightness-105 transition shadow-lg shadow-gold/20"
            >
              Verify a Credential <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right Column (Verification Console Card) */}
        <div className="relative lg:ml-auto w-full max-w-[540px]">
          <div className="rounded-xl border border-white/10 bg-[#0F172A] px-6 py-5 shadow-2xl">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white/70">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                ONLINE
              </div>
              <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                SECURE LAYER
              </div>
            </div>

            {/* Heading */}
            <div>
              <h3 className="text-base font-bold text-white">Verification Console</h3>
              <p className="text-xs text-white/50 mt-0.5">Verify any IUCB issued credential directly.</p>
            </div>

            {/* Inputs & Buttons */}
            <div className="mt-5 space-y-2.5">
              <div>
                <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-white/50 mb-1.5">CREDENTIAL ID</div>
                <input
                  type="text"
                  placeholder="IUCB-ACB-0421 • ISO-27001-9842"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/50 transition-colors font-mono"
                  disabled
                />
              </div>
              <button className="w-full flex items-center justify-center gap-2 bg-[#4273c5] hover:bg-[#325ca6] text-white rounded-lg py-2.5 text-sm font-semibold transition-colors">
                <ShieldCheck className="h-4 w-4" />
                Verify Authenticity
              </button>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 text-xs font-medium text-white transition-colors">
                  <Upload className="h-3.5 w-3.5 opacity-70" />
                  Upload PDF
                </button>
                <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 text-xs font-medium text-white transition-colors">
                  <Camera className="h-3.5 w-3.5 opacity-70" />
                  Use Camera
                </button>
              </div>
            </div>

            {/* Verification Result Card */}
            <div className="mt-4 rounded-lg bg-white/[0.03] border border-white/10 p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] uppercase text-[#34D399] mb-2">
                <CheckCircle2 className="h-3 w-3" />
                CREDENTIAL STATUS
              </div>
              <div className="flex items-center gap-3 mb-4">
                <h4 className="text-xl font-bold text-white">Verified</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                <div>
                  <div className="text-[10px] font-medium text-white/50 mb-0.5">Issuer</div>
                  <div className="text-xs text-white">IUCB</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-medium text-white/50 mb-0.5">Issue Date</div>
                  <div className="text-xs text-white">12 March 2026</div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-white/50 mb-0.5">Status</div>
                  <div className="text-xs font-semibold text-[#34D399]">Active</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-medium text-white/50 mb-0.5">Verification</div>
                  <div className="text-xs text-white">Cryptographically Signed</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center gap-2 text-[10px] text-white/40 border-t border-white/10 pt-3">
              <Lock className="h-3.5 w-3.5" />
              Powered by cryptographic signatures and an immutable registry on ledger.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- TRUST PILLARS ----------------------------- */

function TrustPillars() {
  return (
    <section className="pt-16 pb-10 md:pt-20 md:pb-12 bg-white">
      <div className="container-x">
        <div className="max-w-2xl">
          <div className="eyebrow">Trust Framework</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            Why organizations and regulators trust IUCB
          </h2>
        </div>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trust.map((t) => (
            <div key={t.title} className="rounded-xl border border-border p-6 hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition">
              <div className="h-10 w-10 rounded-md bg-light-blue text-primary grid place-items-center">
                <t.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-navy">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- INDUSTRIES ----------------------------- */

function IndustriesRow() {
  return (
    <section className="py-10 md:py-12 bg-soft-gray">
      <div className="container-x">
        <div className="max-w-2xl">
          <div className="eyebrow">Recognized Across Sectors</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            From Fortune 500 to government agencies
          </h2>
          <p className="mt-3 text-muted-foreground">
            IUCB accreditation is recognized where it matters — across regulated and high-trust industries.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {industries.map((i) => (
            <div key={i.label} className="rounded-xl bg-white border border-border p-6 text-center hover:border-secondary hover:shadow-md transition">
              <i.icon className="h-7 w-7 mx-auto text-secondary" />
              <div className="mt-3 text-sm font-medium text-navy">{i.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
