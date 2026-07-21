import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Globe2,
  Lock,
  ShieldCheck,
  ChevronRight,
  Shield,
  FileCheck2,
  BookOpen,
  Cpu,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { PageHero } from "../components/page-hero";
import { useState } from "react";

export const Route = createFileRoute("/resources/trust-center")({
  head: () => ({
    meta: [
      { title: "Trust Center — IUCB" },
      {
        name: "description",
        content: "IUCB trust pillars, cryptographic ledger security, international recognition, and ISO alignment compliance guidelines.",
      },
    ],
  }),
  component: TrustCenterResources,
});

function TrustCenterResources() {
  const [activeSection, setActiveSection] = useState<string>("pillars");

  return (
    <>
      <PageHero
        eyebrow="Resources & Trust"
        title={
          <>
            IUCB <span className="text-gold">Trust Center</span>
          </>
        }
        description="Providing independent, impartial oversight that governments, regulators, and enterprises worldwide rely on to prove compliance and build trust."
      />

      <section className="py-16 bg-soft-gray min-h-screen">
        <div className="container-x grid lg:grid-cols-12 gap-10">
          {/* SIDEBAR NAVIGATION */}
          <aside className="lg:col-span-3 space-y-2">
            {[
              { id: "pillars", label: "Trust Pillars", icon: ShieldCheck },
              { id: "recognition", label: "International Recognition", icon: Globe2 },
              { id: "security", label: "Cryptographic Security", icon: Lock },
              { id: "alignment", label: "ISO Standard Alignment", icon: BookOpen },
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
            
            {/* TRUST PILLARS */}
            {activeSection === "pillars" && (
              <div className="space-y-8 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">The IUCB Trust Framework</h2>
                  <p className="text-sm text-muted-foreground mt-1">One verified credential at a time, establishing institutional trust.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Global Recognition",
                      desc: "Mutual Recognition Arrangements (MLA) across 85+ jurisdictions ensure accredited certificates are accepted globally.",
                      icon: Globe2,
                    },
                    {
                      title: "Independent Evaluation",
                      desc: "Assessments are governed by an independent oversight council, completely isolated from commercial consulting.",
                      icon: Shield,
                    },
                    {
                      title: "Tamper-Evident Security",
                      desc: "Credentials are cryptographically signed and recorded on an immutable ledger to eliminate compliance fraud.",
                      icon: Lock,
                    },
                    {
                      title: "Standards Alignment",
                      desc: "Rigorous adherence to ISO/IEC 17011, 17021-1, and 17024 guidelines across all operations.",
                      icon: FileCheck2,
                    },
                  ].map((pillar) => (
                    <div key={pillar.title} className="p-5 border border-border rounded-xl space-y-3 hover:shadow-md transition">
                      <div className="h-9 w-9 rounded-lg bg-light-blue text-primary flex items-center justify-center">
                        <pillar.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-navy text-base">{pillar.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{pillar.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INTERNATIONAL RECOGNITION */}
            {activeSection === "recognition" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">International Recognition</h2>
                  <p className="text-sm text-muted-foreground mt-1">Headquartered in Tallinn, Estonia — Serving 80+ Countries.</p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  IUCB sets the benchmark for international conformity assessments. By establishing strategic partnerships and participating in multilateral recognition arrangements, we ensure that an IUCB-accredited certificate carries equivalent authority anywhere in the world.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                  {[
                    { val: "85+", label: "MLA Jurisdictions" },
                    { val: "500+", label: "Accredited Bodies" },
                    { val: "2,000+", label: "Certified Auditors" },
                    { val: "95%+", label: "Tender Pass Rate" },
                  ].map((stat) => (
                    <div key={stat.label} className="border border-border p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-navy">{stat.val}</div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CRYPTOGRAPHIC SECURITY */}
            {activeSection === "security" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">Cryptographic Security & Verification Integrity</h2>
                  <p className="text-sm text-muted-foreground mt-1">Tamper-evident verification backed by decentralization and digital ledgers.</p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Traditional paper and PDF certificates are vulnerable to tampering and forgery. IUCB addresses this by recording every accreditation, certification, and audit tier assignment on an immutable digital ledger.
                </p>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                  <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-gold" /> Cryptographic Integrity Guarantee
                  </h3>
                  <ul className="space-y-3 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Immutable Audit trail:</strong> Every change in accreditation status is recorded as a new state block, ensuring traceability.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Public verification Console:</strong> Anyone can immediately verify a credential's authenticity by entering the Credential ID or scanning the secure QR code.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* ISO STANDARD ALIGNMENT */}
            {activeSection === "alignment" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-border pb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-navy">ISO Standard Alignment</h2>
                  <p className="text-sm text-muted-foreground mt-1">Strict governance complying with international accreditation protocols.</p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  IUCB processes are designed and executed in full compliance with published ISO/IEC guidelines for accreditation and conformity assessment bodies:
                </p>

                <div className="space-y-4 pt-2">
                  {[
                    { std: "ISO/IEC 17011", name: "Requirements for Accreditation Bodies", desc: "Governs how IUCB schedules assessments, conducts reviews, and manages the accreditation registry." },
                    { std: "ISO/IEC 17021-1", name: "Requirements for Management Systems Audits", desc: "Governs our accreditation programs for bodies certifying organizations against ISO 27001, 27701, and 9001." },
                    { std: "ISO/IEC 17024", name: "Requirements for Personnel Certification", desc: "Governs our certification programs validating individual auditor tiers and competence levels." },
                  ].map((iso) => (
                    <div key={iso.std} className="border border-border p-4 rounded-xl space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold bg-gold/20 text-gold-foreground px-2 py-0.5 rounded">
                          {iso.std}
                        </span>
                        <h3 className="font-bold text-navy text-sm">{iso.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pl-1">{iso.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </section>
    </>
  );
}
