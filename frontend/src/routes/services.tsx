import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  Users,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  FileText,
  Award,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Accreditation Programs — IUCB" },
      {
        name: "description",
        content:
          "Formal recognition of competence for Certification Bodies, Auditors, and Training Providers.",
      },
    ],
  }),
  component: Services,
});

const tabs = [
  { id: "cb", label: "Certification Bodies", icon: Building2 },
  { id: "auditors", label: "Auditors", icon: Users },
  { id: "training", label: "Training Providers", icon: GraduationCap },
] as const;

type TabId = (typeof tabs)[number]["id"];

const content: Record<
  TabId,
  {
    badge: string;
    title: string;
    intro: string;
    benefits: string[];
    eligibility: string[];
    standards: string[];
    extra?: { heading: string; rows: { tier: string; experience: string; req: string }[] };
  }
> = {
  cb: {
    badge: "ACB Program",
    title: "Certification Body Accreditation (ACB)",
    intro:
      "The ACB program is designed for organizations that provide audit and certification services. Accreditation by IUCB demonstrates your competence, impartiality, and performance capability — aligned with ISO/IEC 17021 and IAF guidance.",
    benefits: [
      "International recognition across 85+ countries",
      "Mutual recognition with leading accreditation bodies",
      "Enhanced credibility with regulators and clients",
      "Inclusion in the public IUCB Accredited Directory",
    ],
    eligibility: [
      "Legal entity with documented management system",
      "Demonstrated impartiality and independence",
      "Qualified technical assessors and lead auditors",
      "Operational history of at least 12 months",
    ],
    standards: ["ISO/IEC 17021-1", "ISO/IEC 27006", "ISO/IEC 17065", "ISO/IEC 17024"],
  },
  auditors: {
    badge: "AAP Program",
    title: "Auditor Accreditation (AAP)",
    intro:
      "Individual accreditation pathway for management system, cybersecurity, and privacy auditors. Validate your competence and progress through clearly defined tiers.",
    benefits: [
      "Globally portable credential with QR verification",
      "Listed in the IUCB Professional Directory",
      "Structured progression from Associate to Principal",
      "Recognition by IUCB-accredited certification bodies",
    ],
    eligibility: [
      "Recognized degree or equivalent experience",
      "Completed IUCB-approved auditor training",
      "Documented audit experience portfolio",
      "Successful examination performance",
    ],
    standards: ["ISO 19011", "ISO/IEC 27001 LA", "ISO 9001 LA", "ISO 14001 LA"],
    extra: {
      heading: "Auditor Tiers",
      rows: [
        { tier: "Associate", experience: "0–2 Years", req: "Approved training + exam" },
        { tier: "Auditor", experience: "2–5 Years", req: "10+ audits witnessed" },
        { tier: "Lead Auditor", experience: "5+ Years", req: "15+ audits (Lead)" },
        { tier: "Principal", experience: "10+ Years", req: "Subject Matter Expert" },
      ],
    },
  },
  training: {
    badge: "ATPP Program",
    title: "Training Provider Accreditation (ATPP)",
    intro:
      "Recognition for training organizations delivering compliance, audit, and management systems education. Accreditation validates your curriculum, instructors, and examination integrity.",
    benefits: [
      "Approved course listing in IUCB directory",
      "Authority to issue IUCB-recognized certificates",
      "Examination scheme co-branding",
      "Continuous professional development credits",
    ],
    eligibility: [
      "Documented curriculum mapped to IUCB schemes",
      "Qualified instructors with audit experience",
      "Robust examination and grading methodology",
      "Adequate learning facilities (physical or virtual)",
    ],
    standards: ["ISO 21001", "ISO 29993", "IUCB Training Spec v3.0"],
  },
};

function Services() {
  const [active, setActive] = useState<TabId>("cb");
  const c = content[active];

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="container-x py-16 md:py-20">
          <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold">
            Core Services
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
            Accreditation Programs
          </h1>
          <p className="mt-5 max-w-2xl text-white/80 text-lg">
            Formal recognition of competence for Certification Bodies, Auditors, and Training
            Providers — backed by international standards.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container-x">
          <div className="inline-flex bg-soft-gray rounded-lg p-1.5 gap-1 flex-wrap">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition ${
                  active === t.id
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-navy hover:bg-white"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="mt-10 grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <div className="text-xs font-semibold tracking-[0.2em] uppercase text-secondary">
                {c.badge}
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy">{c.title}</h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">{c.intro}</p>

              <div className="mt-10 grid md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-navy flex items-center gap-2">
                    <Award className="h-4 w-4 text-gold" /> Key Benefits
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {c.benefits.map((b) => (
                      <li key={b} className="flex gap-2 text-sm text-navy">
                        <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-navy flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gold" /> Eligibility
                  </h3>
                  <ul className="mt-4 space-y-2.5">
                    {c.eligibility.map((b) => (
                      <li key={b} className="flex gap-2 text-sm text-navy">
                        <CheckCircle2 className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border p-6 bg-soft-gray">
                <h3 className="font-semibold text-navy">Standards Covered</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.standards.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1.5 bg-white border border-border rounded-md text-xs font-mono text-primary"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {c.extra && (
                <div className="mt-6 rounded-xl border border-border overflow-hidden">
                  <div className="bg-soft-gray px-6 py-4 font-semibold text-navy">
                    {c.extra.heading}
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-white border-b border-border">
                      <tr className="text-left">
                        <th className="px-6 py-3 font-semibold text-navy">Tier</th>
                        <th className="px-6 py-3 font-semibold text-navy">Experience</th>
                        <th className="px-6 py-3 font-semibold text-navy">Requirements</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.extra.rows.map((r) => (
                        <tr key={r.tier} className="border-b border-border last:border-0">
                          <td className="px-6 py-3.5 font-semibold text-secondary">{r.tier}</td>
                          <td className="px-6 py-3.5 text-navy">{r.experience}</td>
                          <td className="px-6 py-3.5 text-muted-foreground">{r.req}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-28 rounded-2xl bg-primary text-primary-foreground p-8 relative overflow-hidden">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/20 blur-2xl" />
                <div className="relative">
                  <div className="text-xs font-semibold tracking-[0.2em] uppercase text-gold">
                    Ready to Apply?
                  </div>
                  <h3 className="mt-3 text-xl font-semibold">
                    Start your journey toward global recognition today.
                  </h3>
                  <p className="mt-3 text-sm text-white/75">
                    Download the application kit or contact our team. Response time: 2–3 business
                    days.
                  </p>
                  <div className="mt-6 space-y-3">
                    <Link
                      to="/contact"
                      className="flex items-center justify-center gap-2 px-5 py-3 bg-gold text-gold-foreground rounded-md font-semibold text-sm hover:brightness-105 transition"
                    >
                      Apply for Accreditation <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/documentation"
                      className="flex items-center justify-center gap-2 px-5 py-3 border border-white/30 rounded-md text-sm font-semibold hover:bg-white/10 transition"
                    >
                      <Download className="h-4 w-4" /> Application Kit
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border p-6 bg-light-blue/40">
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Annual Surveillance
                </div>
                <p className="mt-2 text-sm text-navy leading-relaxed">
                  Accreditation is valid for 3 years, subject to successful annual surveillance
                  assessments.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
