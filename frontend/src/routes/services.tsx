import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  FileText,
  Award,
} from "lucide-react";
import { AccreditationCTA } from "../components/AccreditationCTA";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Accreditation Programs — IUCB" },
      {
        name: "description",
        content:
          "Explore IUCB accreditation services for Certification Bodies, Individual Auditors, and Training Providers through internationally recognized accreditation programs.",
      },
    ],
  }),
  component: Services,
});

const tabs = [
  { id: "cb", label: "Certification Bodies", icon: Building2 },
  { id: "auditors", label: "Auditors", icon: Users },
  { id: "training", label: "Training Providers", icon: GraduationCap },
  { id: "advisory", label: "Advisory", icon: Briefcase },
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
    badge: "Certification Body Accreditation",
    title: "Certification Bodies",
    intro:
      "IUCB accredits Certification Bodies that demonstrate competence, impartiality, and consistency in auditing and certifying organizations against internationally recognized standards. Accreditation strengthens market confidence, regulatory acceptance, and global recognition.",

    benefits: [
      "Internationally recognized accreditation framework",
      "Enhanced credibility with regulators, clients, and stakeholders",
      "Listing in the official IUCB Accredited Directory",
      "Greater confidence through independent third-party assessment",
    ],

    eligibility: [
      "Legally established Certification Body",
      "Documented management system and operational procedures",
      "Competent and qualified audit personnel",
      "Demonstrated impartiality, independence, and compliance with IUCB requirements",
    ],

    standards: [
      "ISO/IEC 17021-1",
      "ISO/IEC 27001",
      "ISO/IEC 27701",
      "ISO 9001",
      "SOC 2",
    ],
  },
  auditors: {
    badge: "Individual Auditor Accreditation",

    title: "Individual Auditors",

    intro:
      "IUCB recognizes competent auditing professionals through internationally accredited certification pathways. Auditor accreditation validates technical expertise, practical experience, and professional competence while supporting career progression across globally recognized standards.",

    benefits: [
      "Globally recognized professional credential",
      "Listing in the official IUCB Auditor Directory",
      "Structured career progression through accreditation levels",
      "Enhanced professional credibility and international recognition",
    ],

    eligibility: [
      "Relevant education or equivalent professional experience",
      "Completion of approved auditor training",
      "Demonstrated audit knowledge and practical experience",
      "Successful completion of the required competency assessment",
    ],

    standards: [
      "ISO/IEC 17021-1",
      "ISO/IEC 27001",
      "ISO/IEC 27701",
      "ISO 9001",
      "SOC 2",
    ],

    extra: {
      heading: "Auditor Accreditation Levels",

      rows: [
        {
          tier: "Associate Auditor",
          experience: "Entry Level",
          req: "Approved Training + Competency Assessment",
        },
        {
          tier: "Internal Auditor",
          experience: "Basic Experience",
          req: "Training + Practical Audit Experience",
        },
        {
          tier: "Lead Auditor",
          experience: "Professional",
          req: "Lead Audit Experience + Competency Validation",
        },
        {
          tier: "Principal Auditor",
          experience: "Senior Expert",
          req: "Extensive Audit Leadership & Professional Excellence",
        },
      ],
    },
  },
  training: {
    badge: "Training Provider Accreditation",

    title: "Training Providers",

    intro:
      "IUCB accredits Training Providers that deliver high-quality education, professional development, and competency-based learning. Accreditation confirms that training programs, instructors, and assessment processes meet internationally recognized quality standards.",

    benefits: [
      "International recognition for accredited training programs",
      "Official listing in the IUCB Training Provider Directory",
      "Authority to deliver IUCB-recognized training programs",
      "Enhanced credibility for learners, organizations, and industry partners",
    ],

    eligibility: [
      "Documented training curriculum aligned with international standards",
      "Qualified instructors with relevant industry expertise",
      "Transparent examination and assessment methodology",
      "Appropriate physical or online learning infrastructure",
    ],

    standards: [
      "ISO/IEC 17021-1",
      "ISO/IEC 27001",
      "ISO/IEC 27701",
      "ISO 9001",
      "SOC 2",
    ],
  },
  advisory: {
    badge: "Advisory Program",
    title: "Advisory Board Membership",
    intro:
      "Join IUCB's Advisory Board to shape global accreditation standards, provide strategic guidance, and influence policy direction. Share your expertise and contribute to international best practices.",
    benefits: [
      "Strategic influence on accreditation standards development",
      "Peer networking with global accreditation leaders",
      "Recognition as IUCB Advisory Board Member",
      "Early access to emerging standards and initiatives",
    ],
    eligibility: [
      "Recognized expertise in audit, management systems, or compliance",
      "Senior leadership experience in accreditation or certification",
      "Demonstrated commitment to quality and integrity",
      "Ability to participate in quarterly board meetings",
    ],
    standards: [
      "ISO/IEC 17021-1",
      "ISO/IEC 27001",
      "ISO/IEC 27701",
      "ISO 9001",
      "SOC 2",
    ],
  },
};

function Services() {
  const search = useSearch({ strict: false }) as { tab?: string };
  const navigate = useNavigate();
  const [active, setActive] = useState<TabId>("cb");

  useEffect(() => {
    if (search.tab && ["cb", "auditors", "training", "advisory"].includes(search.tab)) {
      setActive(search.tab as TabId);
    }
  }, [search.tab]);

  const handleTabChange = (tabId: TabId) => {
    setActive(tabId);
    navigate({ to: "/services", search: { tab: tabId } });
  };

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
                onClick={() => handleTabChange(t.id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold transition ${active === t.id
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
              {/* Dynamic CTA — driven entirely by accreditation-cta.config.ts */}
              <AccreditationCTA activeTab={active} />

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
