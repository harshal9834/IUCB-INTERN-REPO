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

      <section className="py-16 bg-white border-b border-border">
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

     <section className="py-20 md:py-24 bg-white">
  <div className="container-x grid lg:grid-cols-3 gap-8">
    {[
      {
        icon: Target,
        title: "Our Mission",
        desc: "To strengthen global confidence in certification, accreditation, and professional competence through independent, transparent, and internationally recognized assessment frameworks.",
      },
      {
        icon: Eye,
        title: "Our Vision",
        desc: "To become the world's most trusted accreditation authority, enabling organizations and professionals to demonstrate excellence through globally recognized credentials.",
      },
      {
        icon: Compass,
        title: "Our Core Values",
        desc: "Integrity, impartiality, transparency, innovation, and continual improvement guide every accreditation and certification activity undertaken by IUCB.",
      },
    ].map((c) => (
      <div
        key={c.title}
        className="rounded-xl border border-border p-8 bg-card"
      >
        <div className="h-12 w-12 rounded-lg bg-light-blue text-primary grid place-items-center">
          <c.icon className="h-6 w-6" />
        </div>

        <h3 className="mt-5 text-xl font-semibold text-navy">
          {c.title}
        </h3>

        <p className="mt-3 text-muted-foreground leading-relaxed">
          {c.desc}
        </p>
      </div>
    ))}
  </div>
</section>
      <section className="py-20 md:py-24 bg-soft-gray">
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

    <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
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

      <section className="py-20 md:py-24 bg-white">
  <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
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
