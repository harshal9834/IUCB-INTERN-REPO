import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Scale,
  Shield,
  Gavel,
  Users,
  FileText,
  ArrowRight,
  AlertTriangle,
  Handshake,
} from "lucide-react";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Trust & Governance — IUCB" },
      {
        name: "description",
        content:
          "IUCB governance, oversight committees, impartiality policy, complaints and appeals processes.",
      },
    ],
  }),
  component: Governance,
});

const policies = [
  {
    icon: Scale,
    title: "Impartiality Policy",
    desc: "Independence from commercial, financial, or political pressures.",
    version: "v4.0",
    date: "Jan 2025",
  },
  {
    icon: Shield,
    title: "Confidentiality Policy",
    desc: "Handling and protection of all client information.",
    version: "v3.1",
    date: "Jan 2025",
  },
  {
    icon: Gavel,
    title: "Complaints & Appeals",
    desc: "Formal mechanisms for raising and resolving disputes.",
    version: "v2.5",
    date: "Dec 2024",
  },
  {
    icon: AlertTriangle,
    title: "Conflict of Interest",
    desc: "Identification, declaration, and mitigation procedures.",
    version: "v2.0",
    date: "Nov 2024",
  },
  {
    icon: Handshake,
    title: "Mutual Recognition",
    desc: "Framework governing cross-border recognition arrangements.",
    version: "v1.4",
    date: "Oct 2024",
  },
  {
    icon: FileText,
    title: "Code of Conduct",
    desc: "Ethical and professional obligations for IUCB personnel.",
    version: "v3.0",
    date: "Sep 2024",
  },
];

const bodies = [
  {
    title: "Board of Governors",
    desc: "Strategic oversight, governance, and final accreditation authority.",
  },
  {
    title: "Accreditation Committee",
    desc: "Independent decision-making on accreditation outcomes.",
  },
  {
    title: "Technical Advisory Panel",
    desc: "Subject-matter expertise across ISO, cybersecurity, and privacy schemes.",
  },
  {
    title: "Impartiality Committee",
    desc: "Safeguards independence and identifies systemic risks.",
  },
];

function Governance() {
  return (
    <>
      <PageHero
        eyebrow="Trust & Governance"
        title={
          <>
            The framework behind every <span className="text-gold">IUCB decision</span>
          </>
        }
        description="Independent oversight, transparent policies, and rigorous governance bodies ensure every accreditation we issue is impartial, traceable, and globally credible."
      />

      <section className="py-20 md:py-24 bg-white">
        <div className="container-x">
          <div className="max-w-2xl">
            <div className="eyebrow">Governance Bodies</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy">
              Independent oversight at every level
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            {bodies.map((b) => (
              <div key={b.title} className="rounded-xl border border-border p-6 bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-light-blue text-primary grid place-items-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-navy">{b.title}</h3>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-soft-gray">
        <div className="container-x">
          <div className="max-w-2xl">
            <div className="eyebrow">Policies & Documentation</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy">
              Published policies, public commitments
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every IUCB policy is publicly documented, version-controlled, and reviewed annually.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {policies.map((p) => (
              <div
                key={p.title}
                className="group rounded-xl border border-border bg-white p-6 hover:border-secondary hover:shadow-lg transition"
              >
                <div className="h-11 w-11 rounded-md bg-light-blue text-primary grid place-items-center">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-semibold text-navy">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {p.version} · {p.date}
                  </span>
                  <Link
                    to="/documentation"
                    className="text-xs font-semibold text-secondary group-hover:text-primary inline-flex items-center gap-1"
                  >
                    Read PDF <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
