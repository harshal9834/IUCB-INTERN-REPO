import { createFileRoute, Link } from "@tanstack/react-router";
import { Target, Eye, Compass, Users, Calendar, MapPin, Award, Globe2 } from "lucide-react";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About IUCB — Global Authority for Accreditation" },
      {
        name: "description",
        content:
          "Founded in 2019 and headquartered in Tallinn, IUCB sets the global standard for trust and excellence in accreditation and certification.",
      },
    ],
  }),
  component: About,
});

const milestones = [
  {
    year: "2019",
    title: "Founded in Tallinn",
    desc: "IUCB established as an independent accreditation authority.",
  },
  {
    year: "2021",
    title: "ISO/IEC 17011 Alignment",
    desc: "Operations formally aligned with international accreditation standards.",
  },
  {
    year: "2023",
    title: "100+ Countries Served",
    desc: "Mutual recognition expanded across regulated industries.",
  },
  {
    year: "2026",
    title: "Digital Trust Framework",
    desc: "Launched tamper-evident, QR-verifiable digital credentials.",
  },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About IUCB"
        title={
          <>
            Setting the Global Standard for <span className="text-gold">Trust</span> &{" "}
            <span className="text-gold">Excellence</span>
          </>
        }
        description="Founded in 2019, the International Union for Certification & Benchmarking (IUCB) bridges the gap between rigid traditional accreditation and the dynamic needs of the modern digital economy."
      />

      <section className="py-16 bg-white border-b border-border">
        <div className="container-x grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { v: "500+", l: "Accredited Organizations" },
            { v: "85+", l: "Countries Served" },
            { v: "50+", l: "Standards Covered" },
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
              desc: "To advance trust in global commerce by accrediting competent, impartial, and consistent certification across industries and borders.",
            },
            {
              icon: Eye,
              title: "Our Vision",
              desc: "A world where every certification carries verified meaning — recognized by regulators, enterprises, and the public alike.",
            },
            {
              icon: Compass,
              title: "Our Values",
              desc: "Integrity, transparency, independence, and continuous excellence in every assessment we deliver.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border p-8 bg-card">
              <div className="h-12 w-12 rounded-lg bg-light-blue text-primary grid place-items-center">
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-navy">{c.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 md:py-24 bg-soft-gray">
        <div className="container-x">
          <div className="max-w-2xl">
            <div className="eyebrow">Our Journey</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy">
              Beyond Traditional Accreditation
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {milestones.map((m) => (
              <div key={m.year} className="rounded-xl bg-white border border-border p-6">
                <div className="text-xs font-mono tracking-widest text-gold">{m.year}</div>
                <div className="mt-3 font-semibold text-navy">{m.title}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-white">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="eyebrow">Headquarters</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-navy">Tallinn, Estonia</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              IUCB operates from one of Europe's most advanced digital governance hubs, supported by
              regional delivery teams across EMEA, APAC, and the Americas.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
              <Stat icon={Users} label="Global Staff" value="120+" />
              <Stat icon={Calendar} label="Established" value="2019" />
              <Stat icon={Globe2} label="Regional Hubs" value="5" />
              <Stat icon={Award} label="MRA Partners" value="22" />
            </div>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-secondary transition"
            >
              Contact our team
            </Link>
          </div>
          <div className="rounded-2xl bg-primary text-primary-foreground p-10 relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
            <MapPin className="h-8 w-8 text-gold" />
            <div className="mt-5 text-2xl font-semibold leading-snug">IUCB Global Headquarters</div>
            <p className="mt-3 text-white/75">Tornimäe 5, 10145 Tallinn, Estonia</p>
            <div className="mt-8 pt-8 border-t border-white/15 grid grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wider text-gold">Email</div>
                <div className="mt-1">info@iucb.org</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gold">Operating Hours</div>
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
