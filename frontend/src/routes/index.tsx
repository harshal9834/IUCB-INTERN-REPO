import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  BadgeCheck,
  Globe2,
  Users,
  Building2,
  GraduationCap,
  Search,
  ArrowRight,
  FileCheck2,
  Award,
  Lock,
  Scale,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Cpu,
  HeartPulse,
  Banknote,
  Factory,
  Landmark,
  Quote,
  QrCode,
  Upload,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IUCB — The Global Authority for Accreditation & Certification" },
      {
        name: "description",
        content:
          "IUCB accredits Certification Bodies, Auditors and Training Providers against ISO, Cybersecurity & Privacy standards — recognized in 85+ countries.",
      },
    ],
  }),
  component: Home,
});

/* ----------------------------- DATA ----------------------------- */

const slides = [
  {
    eyebrow: "Corporate Value",
    title: "Business Benefits",
    accent: "Drive Growth Through Trust",
    body: "Standards, certification, testing, verification, and accreditation help businesses reduce costs, increase productivity, and unlock new markets backed by international recognition.",
    cta: { label: "Read Case Studies", to: "/documentation" },
    stat: { k: "+38%", v: "Market access uplift" },
  },
  {
    eyebrow: "Auditor Networks",
    title: "Auditor Competency Frameworks",
    accent: "Professional Validation Tiers",
    body: "Join a global registry of qualified lead auditors. Multi-tier validation across ISO, cybersecurity, and privacy domains with structured progression and continuous development.",
    cta: { label: "Register as Auditor", to: "/services" },
    stat: { k: "2,000+", v: "Certified auditors" },
  },
  {
    eyebrow: "Institutional Security",
    title: "Cryptographic Validation Engines",
    accent: "Tamper-Proof Issuance",
    body: "Every IUCB credential is cryptographically signed and traceable through public registries — real-time verification from any device, anywhere in the world.",
    cta: { label: "Open Verification", to: "/verify" },
    stat: { k: "100%", v: "Tamper-evident" },
  },
];

const stats = [
  { value: "500+", label: "Accredited Organizations" },
  { value: "80+", label: "Signatory Nations" },
  { value: "2,000+", label: "Certified Auditors" },
  { value: "50+", label: "Standards Covered" },
];

const paths = [
  {
    icon: Building2,
    title: "Organizations",
    desc: "Get accredited or certified against international standards.",
    to: "/services",
  },
  {
    icon: Users,
    title: "Auditors",
    desc: "Earn individual accreditation and advance your career.",
    to: "/services",
  },
  {
    icon: GraduationCap,
    title: "Training Entities",
    desc: "Accredit your courses, exams, and credentialing frameworks.",
    to: "/services",
  },
  {
    icon: Search,
    title: "Verification Agents",
    desc: "Validate authenticity of any IUCB credential instantly.",
    to: "/verify",
  },
];

const problems = [
  {
    problem: "Fragmented compliance frameworks lead to repeated audit failures and rework.",
    solution:
      "One unified ecosystem covering ISO, Cybersecurity & Privacy — accept once, recognized globally.",
  },
  {
    problem: "Certificates from unrecognized bodies carry no weight with regulators.",
    solution:
      "IUCB-accredited certificates are independently assessed and accepted across 85+ jurisdictions.",
  },
  {
    problem: "Auditing professionals lack clear progression and credential portability.",
    solution:
      "Structured tiers from Associate to Lead Auditor with portable, verifiable digital credentials.",
  },
];

const trust = [
  {
    icon: Globe2,
    title: "International Recognition",
    desc: "Mutual recognition arrangements across 85+ jurisdictions.",
  },
  {
    icon: Scale,
    title: "Independent Evaluation",
    desc: "Impartial assessment governed by a dedicated oversight council.",
  },
  {
    icon: Eye,
    title: "Transparent Assessment",
    desc: "Public criteria, published outcomes, and traceable decisions.",
  },
  {
    icon: Lock,
    title: "Secure Digital Records",
    desc: "Tamper-evident credentials with QR and blockchain verification.",
  },
  {
    icon: BadgeCheck,
    title: "Global Standards Alignment",
    desc: "Aligned with ISO/IEC 17011, 17021, 17024 and IAF guidance.",
  },
  {
    icon: Award,
    title: "Professional Competence",
    desc: "Validated expertise across technical and management systems.",
  },
];

const industries = [
  { icon: Cpu, label: "IT & Technology" },
  { icon: HeartPulse, label: "Healthcare" },
  { icon: Banknote, label: "Financial Services" },
  { icon: Factory, label: "Manufacturing" },
  { icon: Landmark, label: "Government" },
  { icon: Briefcase, label: "Professional Services" },
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
      <WhatWeOffer />
      <TrustPillars />
      <IndustriesRow />
    </>
  );
}

/* ----------------------------- HERO CAROUSEL ----------------------------- */

function HeroCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 6500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "#F8FAFC" }}>
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      <div className="absolute -top-32 -right-32 h-[36rem] w-[36rem] rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="container-x relative pt-14 pb-20 md:pt-20 md:pb-28 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center min-h-[560px]">
        {/* LEFT: cross-fade text */}
        <div className="lg:col-span-7 relative min-h-[380px]">
          {slides.map((s, idx) => (
            <div
              key={s.title}
              className={`transition-all duration-700 ${idx === i ? "opacity-100 translate-y-0 relative" : "opacity-0 translate-y-3 absolute inset-0 pointer-events-none"}`}
            >
              <div
                className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.22em] uppercase text-primary bg-white border border-gold/50 rounded-full px-3 py-1.5 shadow-sm"
                style={{ color: "#004B7A" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                {s.eyebrow}
              </div>
              <h1
                className="mt-6 text-4xl md:text-5xl lg:text-[3.6rem] font-semibold leading-[1.05] tracking-tight"
                style={{ color: "#0F172A" }}
              >
                {s.title}
              </h1>
              <div className="mt-3 text-lg md:text-xl font-semibold" style={{ color: "#D4AF37" }}>
                {s.accent}
              </div>
              <p
                className="mt-6 max-w-2xl text-base md:text-[17px] leading-relaxed"
                style={{ color: "#475569" }}
              >
                {s.body}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to={s.cta.to as never}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-gold text-gold-foreground text-sm font-semibold hover:brightness-105 transition shadow-lg shadow-gold/30"
                >
                  {s.cta.label} <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center gap-3 pl-2">
                  <div className="text-2xl font-semibold" style={{ color: "#D4AF37" }}>
                    {s.stat.k}
                  </div>
                  <div className="text-xs leading-tight max-w-[120px]" style={{ color: "#64748B" }}>
                    {s.stat.v}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* tracking controls */}
          <div className="mt-12 flex items-center gap-4">
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
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
              <button
                onClick={() => setI((p) => (p - 1 + slides.length) % slides.length)}
                className="h-8 w-8 grid place-items-center rounded-full border border-primary/25 text-primary hover:bg-primary/5 transition"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setI((p) => (p + 1) % slides.length)}
                className="h-8 w-8 grid place-items-center rounded-full border border-primary/25 text-primary hover:bg-primary/5 transition"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: visual composition */}
        <div className="lg:col-span-5 relative">
          <div className="relative mx-auto max-w-md aspect-[4/5]">
            {/* masked geometry */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-secondary/5 to-transparent blur-2xl" />
            <div className="absolute -top-4 -right-4 h-40 w-40 rounded-3xl border-2 border-gold/50 rotate-6" />
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-2xl bg-gold/20 -rotate-6" />

            {/* Main panel — dark navy card to anchor the gray scene */}
            <div
              className="relative h-full rounded-2xl overflow-hidden border border-white/10 text-white p-7 shadow-2xl shadow-primary/20"
              style={{ background: "linear-gradient(135deg, #0F172A 0%, #004B7A 100%)" }}
            >
              {i === 0 && <BusinessVisual />}
              {i === 1 && <AuditorVisual />}
              {i === 2 && <CryptoVisual />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BusinessVisual() {
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className="text-[10px] tracking-[0.25em] uppercase text-white/70">
          Global Impact Index
        </div>
        <div className="text-[10px] tracking-[0.25em] uppercase text-gold">Q2 / 2026</div>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          { k: "+42%", v: "Audit pass rate" },
          { k: "−31%", v: "Compliance cost" },
          { k: "+18", v: "New markets" },
        ].map((s) => (
          <div key={s.v} className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="text-xl font-semibold text-gold">{s.k}</div>
            <div className="text-[10px] text-white/65 mt-1 leading-tight">{s.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-2.5">
        {[72, 88, 64, 91].map((w, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="text-[10px] w-16 text-white/60 uppercase tracking-wider">
              Sector {idx + 1}
            </div>
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-secondary to-gold rounded-full"
                style={{ width: `${w}%` }}
              />
            </div>
            <div className="text-[10px] w-8 text-white/70 text-right">{w}%</div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg bg-gold/10 border border-gold/30 p-3 text-[11px] text-white/80">
        Independent research: organizations with IUCB-recognized credentials win 2.4× more
        enterprise tenders.
      </div>
    </div>
  );
}

function AuditorVisual() {
  const tiers = [
    { t: "Lead Auditor", c: 412, tone: "gold" },
    { t: "Senior Auditor", c: 780, tone: "secondary" },
    { t: "Associate", c: 808, tone: "muted" },
  ];
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-[10px] tracking-[0.25em] uppercase text-white/70">
          Competency Registry
        </div>
        <div className="text-[10px] tracking-[0.25em] uppercase text-gold">Active</div>
      </div>
      <div className="mt-6 space-y-3">
        {tiers.map((tier) => (
          <div key={tier.t} className="rounded-lg bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-full grid place-items-center ${tier.tone === "gold" ? "bg-gold/20 border border-gold/40 text-gold" : tier.tone === "secondary" ? "bg-secondary/30 border border-secondary/50 text-white" : "bg-white/10 border border-white/15 text-white/80"}`}
                >
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{tier.t}</div>
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">
                    ISO 27001 / 27701
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gold">{tier.c}</div>
                <div className="text-[9px] text-white/60 uppercase">Active</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-5 flex items-center gap-2 text-[11px] text-white/70">
        <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
        Validated against ISO/IEC 17024 personnel scheme.
      </div>
    </div>
  );
}

function CryptoVisual() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="text-[10px] tracking-[0.25em] uppercase text-white/70">Ledger Snapshot</div>
        <div className="inline-flex items-center gap-1 text-[10px] tracking-[0.25em] uppercase text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" /> Live
        </div>
      </div>
      <div className="mt-5 rounded-lg bg-white/5 border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-wider text-white/60">Block #482,914</div>
          <Lock className="h-3.5 w-3.5 text-gold" />
        </div>
        <div className="mt-2 font-mono text-[10px] text-gold/90 break-all leading-relaxed">
          0x3F9A...8B21·E4D0·9C7F·A1B2·6D4E·8F50·1928·77AA
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {["ACC-2026-8942 issued", "AUD-2026-1284 renewed", "TRN-2026-0421 verified"].map(
          (row, idx) => (
            <div
              key={row}
              className="flex items-center justify-between rounded-md bg-white/[0.04] border border-white/10 px-3 py-2 text-[11px]"
            >
              <div className="flex items-center gap-2 text-white/80">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${idx === 0 ? "bg-gold" : "bg-secondary"}`}
                />
                {row}
              </div>
              <span className="font-mono text-[10px] text-white/50">2s ago</span>
            </div>
          ),
        )}
      </div>
      <div className="mt-auto pt-5 grid grid-cols-2 gap-3">
        <div className="rounded-md bg-gold/10 border border-gold/30 p-3 text-center">
          <ShieldCheck className="h-5 w-5 mx-auto text-gold" />
          <div className="mt-1 text-[10px] uppercase tracking-wider text-white/80">Signed</div>
        </div>
        <div className="rounded-md bg-secondary/15 border border-secondary/40 p-3 text-center">
          <QrCode className="h-5 w-5 mx-auto text-white" />
          <div className="mt-1 text-[10px] uppercase tracking-wider text-white/80">QR-ready</div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- KPI STRIP ----------------------------- */

function KpiStrip() {
  return (
    <section className="bg-white border-b border-border">
      <div className="container-x py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="text-center md:text-left border-l-2 border-gold pl-4 md:pl-5"
          >
            <div className="text-3xl md:text-[2.25rem] font-semibold text-gold tracking-tight leading-none">
              {s.value}
            </div>
            <div className="mt-2 text-[12px] text-muted-foreground uppercase tracking-wider">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------- INSTITUTIONAL OVERVIEW ----------------------------- */

function InstitutionalOverview() {
  return (
    <section className="py-20 md:py-24 bg-soft-gray">
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
              <div
                key={x.t}
                className="flex items-center gap-3 rounded-lg bg-white border border-border p-3.5"
              >
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
            <MontagePanel
              className="absolute top-0 left-0 w-[60%] h-[58%]"
              tone="primary"
              Icon={Landmark}
              caption="HQ · Tallinn"
            />
            <MontagePanel
              className="absolute top-[8%] right-0 w-[44%] h-[40%]"
              tone="secondary"
              Icon={Globe2}
              caption="85+ Nations"
            />
            <MontagePanel
              className="absolute bottom-0 right-[8%] w-[58%] h-[52%]"
              tone="gold"
              Icon={ShieldCheck}
              caption="Accredited"
            />
            <MontagePanel
              className="absolute bottom-[12%] left-[6%] w-[34%] h-[34%]"
              tone="light"
              Icon={Users}
              caption="Auditors"
            />
          </div>
        </div>
      </div>


    </section>
  );
}

function MontagePanel({
  className,
  tone,
  Icon,
  caption,
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
      <div
        className={`relative h-full rounded-2xl overflow-hidden border-2 border-gold/60 shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:scale-[1.04] group-hover:ring-2 group-hover:ring-gold/60`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${tones[tone]}`} />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 30% 20%, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
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
    <section className="py-20 md:py-24 bg-white">
      <div className="container-x">
        <div className="max-w-2xl">
          <div className="eyebrow">How Can We Help You?</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            Choose your path to get started
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tailored journeys for every stakeholder in the accreditation ecosystem.
          </p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
    <section className="py-20 md:py-24 bg-soft-gray">
      <div className="container-x">
        <div className="max-w-2xl">
          <div className="eyebrow">The Solution Matrix</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            The Problem We <span className="text-secondary">Solve</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Mapping common industry compliance failures against our platform capabilities.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <article
              key={i}
              className="rounded-2xl overflow-hidden border border-border bg-white shadow-sm hover:shadow-lg transition"
            >
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

/* ----------------------------- WHAT WE OFFER ----------------------------- */

function WhatWeOffer() {
  return (
    <section className="py-20 md:py-24 bg-primary text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="container-x relative">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold">
            What We Offer
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight tracking-tight">
            Accreditation, Certification & Professional Development
          </h2>
          <p className="mt-4 text-white/75">
            A single ecosystem for organizational accreditation, individual certifications, and
            professional development pathways.
          </p>
        </div>
        <div className="mt-12 grid lg:grid-cols-3 gap-5">
          {[
            {
              icon: Building2,
              title: "Accreditation Programs",
              desc: "Formal recognition of competence for Certification Bodies, Auditors, and Training Providers.",
              to: "/services",
            },
            {
              icon: BadgeCheck,
              title: "Certification Schemes",
              desc: "Independent certification against ISO, Cybersecurity, and Privacy standards.",
              to: "/services",
            },
            {
              icon: GraduationCap,
              title: "Professional Development",
              desc: "World-class courses and rigorous exams for compliance professionals.",
              to: "/services",
            },
          ].map((c) => (
            <Link
              key={c.title}
              to={c.to as never}
              className="group rounded-2xl bg-white/[0.06] border border-white/15 p-7 hover:bg-white/[0.1] hover:-translate-y-1 transition-all"
            >
              <div className="h-12 w-12 rounded-lg bg-gold/15 border border-gold/30 text-gold grid place-items-center">
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">{c.desc}</p>
              <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-gold">
                Explore{" "}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- TRUST PILLARS ----------------------------- */

function TrustPillars() {
  return (
    <section className="py-20 md:py-24 bg-white">
      <div className="container-x">
        <div className="max-w-2xl">
          <div className="eyebrow">Trust Framework</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            Why organizations and regulators trust IUCB
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {trust.map((t) => (
            <div
              key={t.title}
              className="rounded-xl border border-border p-6 hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition"
            >
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
    <section className="py-20 md:py-24 bg-soft-gray">
      <div className="container-x">
        <div className="max-w-2xl">
          <div className="eyebrow">Recognized Across Sectors</div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy tracking-tight">
            From Fortune 500 to government agencies
          </h2>
          <p className="mt-4 text-muted-foreground">
            IUCB accreditation is recognized where it matters — across regulated and high-trust
            industries.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {industries.map((i) => (
            <div
              key={i.label}
              className="rounded-xl bg-white border border-border p-6 text-center hover:border-secondary hover:shadow-md transition"
            >
              <i.icon className="h-7 w-7 mx-auto text-secondary" />
              <div className="mt-3 text-sm font-medium text-navy">{i.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
