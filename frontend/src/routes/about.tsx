import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Eye, Compass, Users, Calendar, MapPin, Award, Globe2 } from "lucide-react";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About IUCB — Global Authority for Accreditation" },
      { name: "description", content: "Founded in 2019 and headquartered in Tallinn, IUCB sets the global standard for trust and excellence in accreditation and certification." },
    ],
  }),
  component: About,
});

const milestones = [
  {
    year: "2019",
    title: "IUCB Established",
    desc: "Founded in Tallinn, Estonia as an independent international accreditation body.",
  },
  {
    year: "2021",
    title: "International Expansion",
    desc: "Expanded accreditation activities across multiple global regions.",
  },
  {
    year: "2024",
    title: "Global Recognition",
    desc: "Supporting certification bodies, auditors, and training providers worldwide.",
  },
  {
    year: "2026",
    title: "Digital Trust Platform",
    desc: "Introduced secure QR-enabled and cryptographic credential verification.",
  },
];

function About() {
  return (
    <>
      <PageHero
  eyebrow="About IUCB"
  title={
    <>
      Building <span className="text-gold">Global Trust</span> Through
      <span className="text-gold"> Accreditation</span>
    </>
  }
  description="The International Union for Certification & Benchmarking (IUCB) is an independent international accreditation body dedicated to strengthening confidence in certification, professional competence, and organizational compliance through globally recognized accreditation frameworks."
/>

      <section className="py-10 md:py-12 bg-white border-b border-border">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { v: "500+", l: "Accredited Organizations" },
            { v: "85+", l: "Countries Served" },
            { v: "50+", l: "International Standards" },
            { v: "2,000+", l: "Certified Auditors" },
          ].map((s) => (
            <div key={s.l}>
              <div className="text-4xl font-semibold text-primary tracking-tight">{s.v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

<section className="py-12 md:py-16 bg-white">
  <div className="container-x grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
    {/* LEFT COLUMN */}
    <div className="max-w-xl">
      <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.2em] uppercase text-primary">
        <div className="w-8 h-[2px] bg-primary/20" />
        MISSION & VISION
      </div>
      <h2 className="mt-5 text-4xl md:text-[2.75rem] font-bold text-navy leading-[1.1] tracking-tight">
        Advancing Global Trust Through Rigorous Standards.
      </h2>
      <p className="mt-5 text-muted-foreground text-[17px] leading-relaxed">
        Our mission is to establish a unified, globally recognized ecosystem for compliance and certification. We empower organizations and professionals to demonstrate their competence through transparent, impartial, and technologically secure accreditation.
      </p>
      <p className="mt-4 text-muted-foreground text-[15px] leading-relaxed">
        Our vision is a world where compliance is not a barrier to entry, but a verifiable asset that drives cross-border commerce, secures data privacy, and elevates industry standards globally.
      </p>

      <div className="mt-10 grid sm:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border p-6 bg-white shadow-sm">
          <div className="h-10 w-10 rounded-full bg-soft-gray text-primary grid place-items-center mb-5">
            <Target className="h-5 w-5" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy mb-3">MISSION</div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            A unified accreditation ecosystem with impartial verification, designed to strengthen global trust and professional competence.
          </p>
        </div>
        <div className="rounded-2xl border border-border p-6 bg-white shadow-sm">
          <div className="h-10 w-10 rounded-full bg-soft-gray text-primary grid place-items-center mb-5">
            <Eye className="h-5 w-5" />
          </div>
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-navy mb-3">VISION</div>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            A compliance landscape where verified certification unlocks global opportunity and protects every stakeholder.
          </p>
        </div>
      </div>
    </div>

    {/* RIGHT COLUMN */}
    <div className="relative lg:ml-auto w-full max-w-[540px]">
      <div className="rounded-3xl border border-white/10 bg-[#0F172A] p-10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        
        <div className="relative h-44 w-44 rounded-full bg-white shadow-[0_0_60px_rgba(255,255,255,0.1)] p-1.5 flex items-center justify-center mb-10 mt-4">
          <img src="/logos/FINAL_LOGO_DESIGN.jpeg" alt="IUCB Logo" className="h-full w-full object-contain rounded-full" />
        </div>

        <div className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-gold border border-gold/30 rounded-full px-4 py-1.5 bg-gold/5 relative z-10 mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          CORPORATE ARCHITECTURE
        </div>

        <p className="text-[15px] text-white/70 leading-relaxed max-w-[340px] relative z-10 mb-12">
          A bold, modern visual that reflects IUCB's commitment to standards, governance, and international recognition.
        </p>

        <div className="flex items-center justify-center gap-4 sm:gap-6 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase w-full relative z-10 mb-2">
          <span>INTEGRITY</span>
          <span>UNITY</span>
          <span>COMPETENCE</span>
          <span>BENCHMARKING</span>
        </div>
      </div>
    </div>
  </div>
</section>
      <section className="py-10 md:py-14 bg-soft-gray">
  <div className="container-x">
    <div className="max-w-2xl">
      <div className="eyebrow">Our Journey</div>

      <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy">
        Building Global Confidence Since 2019
      </h2>

      <p className="mt-4 text-muted-foreground leading-relaxed">
        Since its establishment, IUCB has continuously expanded its
        international presence by strengthening accreditation frameworks,
        supporting certification bodies, developing professional competency,
        and introducing trusted digital verification technologies for
        organizations worldwide.
      </p>
    </div>

    <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {milestones.map((m) => (
        <div
          key={m.year}
          className="rounded-xl bg-white border border-border p-6"
        >
          <div className="text-xs font-mono tracking-widest text-gold">
            {m.year}
          </div>

          <div className="mt-3 font-semibold text-navy">
            {m.title}
          </div>

          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {m.desc}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>

<section className="py-12 md:py-16 bg-white">
  <div className="container-x">
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-3xl md:text-[2.5rem] font-semibold text-navy tracking-tight">
        Guided by Industry <span className="text-[#0274b3]">Experts.</span>
      </h2>
      <p className="mt-5 text-muted-foreground leading-relaxed text-[15px]">
        IUCB's strategic direction is managed by our executive team, while our accreditation decisions are strictly governed by an Independent Oversight Council to ensure complete impartiality.
      </p>
    </div>

    <div className="mt-10 max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
      {/* Card 1 */}
      <div className="rounded-2xl border border-border p-7 bg-white shadow-sm flex flex-col items-start text-left">
        <div className="h-12 w-12 rounded-full bg-[#fdf5eb] text-[#c0965c] flex items-center justify-center font-bold text-[13px] mb-5 shadow-inner">
          ER
        </div>
        <h3 className="font-bold text-navy text-[17px]">Dr. Elena Rostova</h3>
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c0965c] mt-1.5 mb-4">
          EXECUTIVE DIRECTOR
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Leads IUCB's strategic direction with a focus on regulatory alignment and international trust frameworks.
        </p>
      </div>

      {/* Card 2 */}
      <div className="rounded-2xl border border-border p-7 bg-white shadow-sm flex flex-col items-start text-left">
        <div className="h-12 w-12 rounded-full bg-[#fdf5eb] text-[#c0965c] flex items-center justify-center font-bold text-[13px] mb-5 shadow-inner">
          MC
        </div>
        <h3 className="font-bold text-navy text-[17px]">Marcus Chen</h3>
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c0965c] mt-1.5 mb-4">
          HEAD OF DIGITAL INTEGRITY
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Architect of IUCB's credential security, ensuring every certificate is tamper-evident and globally verifiable.
        </p>
      </div>

      {/* Card 3 */}
      <div className="rounded-2xl border border-border p-7 bg-white shadow-sm flex flex-col items-start text-left">
        <div className="h-12 w-12 rounded-full bg-[#fdf5eb] text-[#c0965c] flex items-center justify-center font-bold text-[13px] mb-5 shadow-inner">
          SJ
        </div>
        <h3 className="font-bold text-navy text-[17px]">Sarah Jenkins</h3>
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#c0965c] mt-1.5 mb-4">
          CHAIR OF THE OVERSIGHT COUNCIL
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Acting independently of the executive team, Sarah brings 15 years of regulatory auditing experience to ensure all accreditation decisions remain objective and free from influence.
        </p>
      </div>
    </div>
  </div>
</section>

      <section className="py-10 md:py-14 bg-white">
  <div className="container-x grid lg:grid-cols-2 gap-10 items-center">
    <div>
      <div className="eyebrow">Global Headquarters</div>

      <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy">
        Tallinn, Estonia
      </h2>

      <p className="mt-5 text-muted-foreground leading-relaxed">
        Headquartered in Tallinn, Estonia, IUCB coordinates international
        accreditation activities through a global network of certification
        bodies, auditors, training providers, regulatory authorities, and
        strategic partners committed to strengthening trust, competence,
        and compliance worldwide.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
        <Stat icon={Users} label="Accredited Organizations" value="500+" />
        <Stat icon={Calendar} label="Founded" value="2019" />
        <Stat icon={Globe2} label="Countries Served" value="85+" />
        <Stat icon={Award} label="Certified Auditors" value="2,000+" />
      </div>

      <Link
        to="/contact"
        className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-secondary transition"
      >
        Contact Our Team
      </Link>
    </div>

    <div className="rounded-2xl bg-primary text-primary-foreground p-10 relative overflow-hidden">
      <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />

      <MapPin className="h-8 w-8 text-gold" />

      <div className="mt-5 text-2xl font-semibold leading-snug">
        IUCB Global Headquarters
      </div>

      <p className="mt-3 text-white/75">
        Tornimäe 5, 10145 Tallinn, Estonia
      </p>

      <div className="mt-8 pt-8 border-t border-white/15 grid grid-cols-2 gap-6 text-sm">
        <div>
          <div className="text-xs uppercase tracking-wider text-gold">
            Email
          </div>
          <div className="mt-1">info@iucb.org</div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-gold">
            Operating Hours
          </div>
          <div className="mt-1">Mon–Fri · 09:00–18:00 EET</div>
        </div>
      </div>
    </div>
  </div>
</section>
    </>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <Icon className="h-4 w-4 text-secondary" />
      <div className="mt-2 text-xl font-semibold text-navy">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
