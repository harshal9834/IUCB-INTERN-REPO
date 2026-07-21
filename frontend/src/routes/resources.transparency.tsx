import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Gavel,
  ShieldAlert,
  FileCheck2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Lock,
  Info,
  Clock,
  Eye,
  Download,
} from "lucide-react";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/resources/transparency")({
  head: () => ({
    meta: [
      { title: "Transparency & Grievances — IUCB" },
      {
        name: "description",
        content: "IUCB Transparency center, Appeals process, Complaints Handling workflow, and Code of Professional Conduct.",
      },
    ],
  }),
  component: TransparencyResources,
});

function TransparencyResources() {
  const [activeSection, setActiveSection] = useState<string>("appeals");

  return (
    <>
      <PageHero
        eyebrow="Resources & Transparency"
        title={
          <>
            IUCB <span className="text-gold">Transparency Center</span>
          </>
        }
        description="Public accountability protocols, dispute resolution mechanisms, and professional ethical commitments."
      />

      <section className="py-16 bg-soft-gray min-h-screen">
        <div className="container-x grid lg:grid-cols-12 gap-10">
          {/* SIDEBAR NAVIGATION */}
          <aside className="lg:col-span-3 space-y-2">
            {[
              { id: "appeals", label: "Appeals Process", icon: Gavel },
              { id: "complaints", label: "Complaints Procedure", icon: ShieldAlert },
              { id: "ethics", label: "Code of Ethics", icon: FileCheck2 },
              { id: "conflict", label: "Conflict of Interest", icon: Scale },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl text-left text-sm font-semibold transition ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-white border border-border text-navy hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <section.icon className="h-4 w-4 shrink-0" />
                  <span>{section.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </button>
            ))}
          </aside>

          {/* MAIN WINDOW */}
          <main className="lg:col-span-9 bg-white border border-border rounded-2xl p-8 shadow-sm space-y-12">
            
            {/* APPEALS PROCESS */}
            {activeSection === "appeals" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">The IUCB Appeals Process</h2>
                  <p className="text-sm text-muted-foreground mt-1">Dispute resolution timeline for applicant and accredited entities.</p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  IUCB ensures that any adverse decision regarding accreditation (denial, suspension, or revocation) can be appealed by the affected body. All appeals are investigated by an independent panel with no prior involvement in the assessment.
                </p>

                <div className="space-y-4 pt-2">
                  <h3 className="font-bold text-navy text-base">Appeals Process Timeline</h3>
                  <div className="relative border-l border-gold/40 pl-6 ml-3 space-y-6">
                    {[
                      { step: "01", name: "Lodging an Appeal", desc: "Written appeal must be submitted within 30 calendar days of the decision date." },
                      { step: "02", name: "Formal Acknowledgement", desc: "IUCB issues a written receipt within 5 business days." },
                      { step: "03", name: "Appeals Panel Appointment", desc: "Appointment of 3 independent members who hold subject-matter expertise." },
                      { step: "04", name: "Evidence & Audit Logs", desc: "Panel reviews original audit files, compliance reports, and witness logs." },
                      { step: "05", name: "Independent Decision", desc: "The panel issues a formal decision, accompanied by a detailed written rationale." },
                      { step: "06", name: "Official Notification", desc: "Official notification is dispatched to all involved parties." },
                      { step: "07", name: "Closure & Records", desc: "The registry and digital ledger are updated, and the record is closed." },
                    ].map((step) => (
                      <div key={step.step} className="relative space-y-1">
                        <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-gold border-2 border-white shadow-sm" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-gold">Step {step.step}:</span>
                          <h4 className="font-bold text-navy text-sm">{step.name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-1">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COMPLAINTS PROCEDURE */}
            {activeSection === "complaints" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">Complaints Handling & Grievance Policy</h2>
                  <p className="text-sm text-muted-foreground mt-1">Operational procedure for complaints regarding accredited bodies or IUCB personnel.</p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  IUCB maintains a formal process for investigating complaints from the public, government agencies, or commercial entities regarding accredited registrars, certified auditors, or IUCB personnel.
                </p>

                <div className="grid sm:grid-cols-2 gap-5 pt-4">
                  <div className="border border-border p-5 rounded-xl space-y-2">
                    <h3 className="font-bold text-navy text-sm">1. Submission & Validation</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Complaints must be submitted in writing. IUCB performs an initial validation to check if the complaint contains objective evidence and relates to accredited activities.
                    </p>
                  </div>
                  <div className="border border-border p-5 rounded-xl space-y-2">
                    <h3 className="font-bold text-navy text-sm">2. Investigation & Action</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      If validated, IUCB appoints an investigator. The accredited body is required to respond. If a breach is found, a non-conformity is issued requiring correction.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CODE OF ETHICS */}
            {activeSection === "ethics" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">Code of Professional Ethics</h2>
                  <p className="text-sm text-muted-foreground mt-1">Core commitments binding IUCB personnel and accredited auditors.</p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  All IUCB assessors, committee panel members, and certified registrars are bound by our 7 Core Principles:
                </p>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  {[
                    { num: "01", name: "Integrity", desc: "Conducting audits with absolute honesty, compliance, and honor." },
                    { num: "02", name: "Independence", desc: "No conflict of interest with evaluated clients or registrars." },
                    { num: "03", name: "Confidentiality", desc: "Protecting proprietary data, reports, and client trade secrets." },
                    { num: "04", name: "Professional Conduct", desc: "Acting with standard-compliant decorum and operational respect." },
                    { num: "05", name: "Transparency", desc: "Providing factual, unaltered data logs and audit outcomes." },
                    { num: "06", name: "Accountability", desc: "Accepting full ownership of peer assessment conclusions." },
                    { num: "07", name: "Fairness", desc: "Impartial treatment of all entities, regardless of size or region." },
                  ].map((p) => (
                    <div key={p.num} className="p-4 border border-border rounded-xl space-y-1">
                      <div className="text-xs font-mono font-bold text-gold">Principle {p.num}</div>
                      <h3 className="font-bold text-navy text-sm">{p.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONFLICT OF INTEREST */}
            {activeSection === "conflict" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">Conflict of Interest Mitigation</h2>
                  <p className="text-sm text-muted-foreground mt-1">Rigorous compliance protocols preventing bias and operational overlaps.</p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  To secure impartiality across all evaluations, IUCB enforces a strict firewall:
                </p>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                    <Info className="h-4 w-4 text-gold" /> Conflict Prevention Protocols
                  </h3>
                  <ul className="space-y-3 text-xs text-slate-600">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Consultancy Firewall:</strong> No IUCB board member or assessor may consult for an applicant body within 2 years of evaluation.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Financial Isolation:</strong> Fixed compensation models ensure no assessor is paid based on the outcome of an audit.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </main>
        </div>
      </section>
    </>
  );
}
