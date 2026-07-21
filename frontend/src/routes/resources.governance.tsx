import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Scale,
  Shield,
  Users,
  FileText,
  CheckCircle2,
  Lock,
  Building2,
  ShieldCheck,
  ChevronRight,
  Gavel,
  AlertTriangle,
  UserCheck,
  Info,
} from "lucide-react";
import { PageHero } from "../components/page-hero";
import { useState } from "react";

export const Route = createFileRoute("/resources/governance")({
  head: () => ({
    meta: [
      { title: "Governance Framework — IUCB" },
      {
        name: "description",
        content: "Detailed governance framework, Board & Council, Technical Committee, and Impartiality safeguards of the International Union for Certification & Benchmarking.",
      },
    ],
  }),
  component: GovernanceResources,
});

function GovernanceResources() {
  const [activeSection, setActiveSection] = useState<string>("framework");

  return (
    <>
      <PageHero
        eyebrow="Resources & Governance"
        title={
          <>
            IUCB <span className="text-gold">Governance Framework</span>
          </>
        }
        description="Headquartered in Tallinn, Estonia. Our structured division of strategic, technical, and impartiality oversight guarantees objective decisions and public confidence."
      />

      <section className="py-16 bg-soft-gray min-h-screen">
        <div className="container-x grid lg:grid-cols-12 gap-10">
          {/* SIDEBAR NAVIGATION */}
          <aside className="lg:col-span-3 space-y-2">
            {[
              { id: "framework", label: "Governance Structure", icon: ShieldCheck },
              { id: "leadership", label: "Leadership & Council", icon: Users },
              { id: "technical", label: "Technical Committees", icon: Building2 },
              { id: "impartiality", label: "Impartiality Committee", icon: Scale },
              { id: "decisions", label: "Decision Process", icon: Gavel },
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

          {/* MAIN DOCUMENTATION WINDOW */}
          <main className="lg:col-span-9 bg-white border border-border rounded-2xl p-8 shadow-sm space-y-12">
            
            {/* GOVERNANCE STRUCTURE */}
            {activeSection === "framework" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">Organizational Governance Structure</h2>
                  <p className="text-sm text-muted-foreground mt-1">Strategic oversight, separation of powers, and regulatory frameworks.</p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <h3 className="font-bold text-navy flex items-center gap-2">
                    <Info className="h-4 w-4 text-gold" /> Systemic Separation of Powers
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    To eliminate conflict of interest and guarantee absolute credibility, IUCB is structurally divided into independent bodies. Strategic administration, standards development, operational assessments, and final decision-making are managed by separate, self-governing panels.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5 pt-4">
                  <div className="border border-border p-5 rounded-xl space-y-3 hover:border-gold transition">
                    <h4 className="font-bold text-navy text-base">Accreditation Board</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Holds the ultimate authority for accreditation policies. Responsible for ensuring compliance with ISO/IEC 17011 guidelines.
                    </p>
                  </div>
                  <div className="border border-border p-5 rounded-xl space-y-3 hover:border-gold transition">
                    <h4 className="font-bold text-navy text-base">Oversight Council</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      An independent supervisory committee acting as a firewall between executive administration and final credential approvals.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* LEADERSHIP & OVERSIGHT COUNCIL */}
            {activeSection === "leadership" && (
              <div className="space-y-8 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">Leadership & Oversight Council</h2>
                  <p className="text-sm text-muted-foreground mt-1">Meet the officers responsible for our strategic and supervisory steering.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      name: "Dr. Elena Rostova",
                      role: "Executive Director",
                      bio: "Over 20 years of experience in international trade compliance and ISO standardization. Dr. Rostova handles IUCB's global expansion and signatory nation relations.",
                      avatar: "ER",
                      badge: "Strategic Administration",
                    },
                    {
                      name: "Marcus Chen",
                      role: "Head of Digital Integrity",
                      bio: "A pioneer in cryptographic security, Marcus leads the development and security of IUCB's cryptographic ledger.",
                      avatar: "MC",
                      badge: "Ledger Technology",
                    },
                  ].map((lead) => (
                    <div key={lead.name} className="border border-border rounded-xl p-5 bg-slate-50/50 flex gap-4">
                      <div className="h-12 w-12 rounded-xl bg-navy text-gold text-lg font-bold flex items-center justify-center shrink-0">
                        {lead.avatar}
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-navy text-base">{lead.name}</div>
                        <div className="text-xs font-semibold text-secondary">{lead.role}</div>
                        <p className="text-xs text-slate-600 pt-2 leading-relaxed">{lead.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                  <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-gold" /> Independent Oversight Council
                  </h3>
                  <div className="border border-border p-5 rounded-xl bg-white space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 text-primary font-bold text-sm flex items-center justify-center shrink-0 border">
                        SJ
                      </div>
                      <div>
                        <div className="font-bold text-navy text-sm">Sarah Jenkins</div>
                        <div className="text-xs text-muted-foreground">Chair of the Oversight Council</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sarah Jenkins brings 15 years of regulatory auditing experience to the Oversight Council. Under her chairmanship, the council acts independently of the executive team to review audit reports and issue final accreditation decisions, ensuring zero conflict of interest.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TECHNICAL COMMITTEES */}
            {activeSection === "technical" && (
              <div className="space-y-8 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">Technical Advisory Committees</h2>
                  <p className="text-sm text-muted-foreground mt-1">Development of accreditation criteria, peer reviews, and ISO alignment.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-navy text-base">Accreditation Scheme Coverage</h3>
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-border">
                        <tr>
                          <th className="p-3">Standard</th>
                          <th className="p-3">Governance Focus</th>
                          <th className="p-3">Scope</th>
                          <th className="p-3">Alignment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-slate-600 font-medium">
                        {[
                          { std: "ISO/IEC 27001", focus: "Information Security Management", scope: "Organization & CB Audits", align: "ISMS Framework" },
                          { std: "ISO/IEC 17021-1", focus: "Audit Body Competence Requirements", scope: "Certification Bodies", align: "Accreditation Core" },
                          { std: "ISO/IEC 17024", focus: "Personnel Certification Criteria", scope: "Individual Auditors", align: "Personnel Core" },
                          { std: "ISO/IEC 27701", focus: "Privacy Information Management", scope: "Privacy & Data Audits", align: "PIMS Framework" },
                          { std: "SOC 2", focus: "Trust Services Criteria", scope: "Cloud & SaaS Providers", align: "AICPA Standards" },
                        ].map((row) => (
                          <tr key={row.std} className="hover:bg-slate-50/50">
                            <td className="p-3 font-bold text-navy font-mono">{row.std}</td>
                            <td className="p-3">{row.focus}</td>
                            <td className="p-3">{row.scope}</td>
                            <td className="p-3 text-secondary font-semibold">{row.align}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-4 border-t border-border pt-6">
                  <h3 className="font-bold text-navy text-base">Standards Review & Technical Workflow</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { step: "01", name: "Drafting", desc: "Formulation of requirements and checklists based on ISO standards." },
                      { step: "02", name: "Review", desc: "Technical Advisory Panel conducts thorough compliance evaluations." },
                      { step: "03", name: "Peer Audit", desc: "Feedback gathered from international compliance experts." },
                      { step: "04", name: "Release", desc: "Final scheme publication and registrar transition guides." },
                    ].map((step) => (
                      <div key={step.step} className="p-4 rounded-xl border border-border bg-slate-50/50 space-y-2">
                        <div className="text-xl font-bold font-mono text-gold">{step.step}</div>
                        <div className="font-bold text-navy text-sm">{step.name}</div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* IMPARTIALITY COMMITTEE */}
            {activeSection === "impartiality" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">Impartiality Committee & Safeguards</h2>
                  <p className="text-sm text-muted-foreground mt-1">Ensuring complete objectivity and conflict mitigation.</p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  The Impartiality Committee is an independent steering panel composed of balanced stakeholders (industry representatives, regulatory experts, and public interest groups). No single interest is allowed to dominate.
                </p>

                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                  {[
                    { title: "No Consulting", desc: "IUCB does not offer consultancy services or commercial software audits to prevent self-review risks." },
                    { title: "Risk Register", desc: "Continuous monitoring of financial, operational, or personal relationships that could impact objectivity." },
                    { title: "Recusal Rules", desc: "Assessors must disclose any prior association with the target entity and recuse themselves instantly." },
                  ].map((item) => (
                    <div key={item.title} className="p-4 border border-border rounded-xl space-y-2">
                      <div className="font-bold text-navy text-sm">{item.title}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DECISION PROCESS */}
            {activeSection === "decisions" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">Decision Process Framework</h2>
                  <p className="text-sm text-muted-foreground mt-1">Operational procedures from evaluation logs to final certification approval.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-navy text-base">Step-by-Step Approval Framework</h3>
                  <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                    {[
                      { step: "Stage 1", name: "Assessment Team Report", desc: "Lead assessor compiles on-site and witness audit outcomes, noting any non-conformities." },
                      { step: "Stage 2", name: "Technical Review Panel", desc: "Independent evaluators review the report to ensure the assessment conformed to ISO/IEC 17011." },
                      { step: "Stage 3", name: "Oversight Council Approval", desc: "Oversight Council reviews recommendation reports and makes the final accreditation decision." },
                      { step: "Stage 4", name: "Ledger Publication", desc: "Verifiable credentials cryptographically signed and published on the immutable registry." },
                    ].map((item) => (
                      <div key={item.step} className="p-4 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row gap-4">
                        <span className="text-xs font-mono font-bold text-gold shrink-0">{item.step}</span>
                        <div className="space-y-1">
                          <h4 className="font-bold text-navy text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </section>
    </>
  );
}
