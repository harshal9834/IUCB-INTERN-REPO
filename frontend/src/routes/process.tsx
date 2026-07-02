import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileCheck2,
  ClipboardCheck,
  ShieldCheck,
  Award,
  FileSearch,
  RefreshCcw,
  Globe2,
  ArrowRight,
} from "lucide-react";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/process")({
  head: () => ({
    meta: [
      { title: "Accreditation Process — IUCB" },
      {
        name: "description",
        content:
          "End-to-end IUCB accreditation workflow: application, review, technical assessment, evaluation, decision, certification, and public verification.",
      },
    ],
  }),
  component: Process,
});

const steps = [
  {
    icon: FileCheck2,
    title: "Application Submission",
    desc: "Submit your application with required documentation and evidence of compliance.",
    duration: "Week 1",
  },
  {
    icon: FileSearch,
    title: "Document Review",
    desc: "Initial completeness check and documentation assessment by the accreditation team.",
    duration: "Week 1–2",
  },
  {
    icon: ClipboardCheck,
    title: "Technical Assessment",
    desc: "On-site or virtual assessment by qualified IUCB technical assessors.",
    duration: "Week 3–5",
  },
  {
    icon: ShieldCheck,
    title: "Independent Evaluation",
    desc: "Findings reviewed by the IUCB Accreditation Committee for impartiality.",
    duration: "Week 6",
  },
  {
    icon: Award,
    title: "Accreditation Decision",
    desc: "Formal approval and issuance of the IUCB accreditation certificate.",
    duration: "Week 7",
  },
  {
    icon: Globe2,
    title: "Public Verification",
    desc: "Listing in the IUCB Accredited Directory with QR-verifiable credentials.",
    duration: "Week 8",
  },
  {
    icon: RefreshCcw,
    title: "Annual Surveillance",
    desc: "Yearly surveillance audits maintain accreditation throughout the 3-year cycle.",
    duration: "Ongoing",
  },
];

function Process() {
  return (
    <>
      <PageHero
        eyebrow="Workflow"
        title={
          <>
            The IUCB Accreditation <span className="text-gold">Process</span>
          </>
        }
        description="A transparent, internationally aligned workflow — from initial application to global public verification — typically completed in 6 to 8 weeks."
      />

      <section className="py-20 md:py-24 bg-white">
        <div className="container-x">
          <div className="relative">
            <div className="hidden md:block absolute left-7 top-2 bottom-2 w-px bg-border" />
            <ol className="space-y-6">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className="relative grid md:grid-cols-[3.5rem_1fr] gap-5 items-start"
                >
                  <div className="relative">
                    <div className="h-14 w-14 rounded-xl bg-primary text-primary-foreground grid place-items-center shadow-md">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-gold text-gold-foreground text-[10px] font-bold grid place-items-center">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-navy">{s.title}</h3>
                      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed max-w-xl">
                        {s.desc}
                      </p>
                    </div>
                    <div className="text-xs font-mono tracking-wider uppercase px-3 py-1.5 bg-light-blue/50 text-primary rounded-md whitespace-nowrap self-start md:self-auto">
                      {s.duration}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-16 rounded-2xl bg-soft-gray p-10 text-center">
            <h3 className="text-2xl font-semibold text-navy">Begin your accreditation journey</h3>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Our accreditation managers respond within 2–3 business days.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-secondary transition"
              >
                Apply for Accreditation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-border bg-white font-semibold text-navy hover:border-secondary transition"
              >
                Talk to Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
