import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  BadgeCheck,
  Building2,
  Users,
  GraduationCap,
  Filter,
  Globe2,
} from "lucide-react";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "Accredited Directory — IUCB" },
      {
        name: "description",
        content:
          "Search the global IUCB directory of accredited certification bodies, auditors, and training providers.",
      },
    ],
  }),
  component: Directory,
});

type Entry = {
  name: string;
  type: "Certification Body" | "Auditor" | "Training Provider";
  country: string;
  standards: string[];
  id: string;
};

const entries: Entry[] = [
  {
    name: "EuroCert International",
    type: "Certification Body",
    country: "Germany",
    standards: ["ISO 27001", "ISO 9001"],
    id: "IUCB-ACB-0421",
  },
  {
    name: "Nordic Assurance Group",
    type: "Certification Body",
    country: "Sweden",
    standards: ["ISO 27701", "ISO 14001"],
    id: "IUCB-ACB-0388",
  },
  {
    name: "AsiaCert Holdings",
    type: "Certification Body",
    country: "Singapore",
    standards: ["ISO 27001", "SOC 2"],
    id: "IUCB-ACB-0501",
  },
  {
    name: "Dr. Aisha Khan",
    type: "Auditor",
    country: "United Arab Emirates",
    standards: ["ISO 27001 LA"],
    id: "IUCB-AAP-1284",
  },
  {
    name: "Marco Bertelli",
    type: "Auditor",
    country: "Italy",
    standards: ["ISO 9001 LA"],
    id: "IUCB-AAP-0921",
  },
  {
    name: "Compliance Academy EU",
    type: "Training Provider",
    country: "Netherlands",
    standards: ["ISO 27001", "ISO 9001"],
    id: "IUCB-ATPP-203",
  },
  {
    name: "Global Audit Institute",
    type: "Training Provider",
    country: "United Kingdom",
    standards: ["ISO 19011"],
    id: "IUCB-ATPP-187",
  },
  {
    name: "Pacific Cert Services",
    type: "Certification Body",
    country: "Australia",
    standards: ["ISO 27001"],
    id: "IUCB-ACB-0445",
  },
];

const filters = ["All", "Certification Body", "Auditor", "Training Provider"] as const;

const iconFor = (t: Entry["type"]) =>
  t === "Certification Body" ? Building2 : t === "Auditor" ? Users : GraduationCap;

function Directory() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [certId, setCertId] = useState("IUCB-ACB-0421");

  const results = useMemo(() => {
    const ql = q.toLowerCase();
    return entries.filter((e) => {
      const matchesFilter = filter === "All" || e.type === filter;
      const matchesQ =
        !ql ||
        e.name.toLowerCase().includes(ql) ||
        e.country.toLowerCase().includes(ql) ||
        e.standards.some((s) => s.toLowerCase().includes(ql));
      return matchesFilter && matchesQ;
    });
  }, [q, filter]);

  return (
    <>
      <PageHero
        eyebrow="Public Registry"
        title={
          <>
            Accredited <span className="text-gold">Directory</span>
          </>
        }
        description="Search our global directory of accredited certification bodies, certified auditors, and approved training providers."
      />

      {/* Verification Section */}
      <section className="py-12 bg-light-blue/20">
        <div className="container-x">
          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            <label className="text-[12px] font-semibold uppercase tracking-wider text-primary">
              Certificate ID
            </label>
            <div className="mt-3 grid sm:grid-cols-[1fr_auto] gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="e.g. IUCB-ACB-0421"
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-border bg-white text-navy focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition">
                Verify Certificate
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Or scan the QR code on your certificate</span>
              <span>•</span>
              <span>Try: IUCB-ACB-0421</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container-x">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
            <div className="grid md:grid-cols-[1fr_auto] gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name, country, or standard..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg border border-border bg-white text-navy placeholder:text-muted-foreground focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="px-4 py-3.5 rounded-lg border border-border bg-white text-navy text-sm font-medium focus:outline-none focus:border-secondary"
                >
                  {filters.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5" /> {results.length} of {entries.length} entries
              </span>
              <span>•</span>
              <span>Updated daily from the IUCB registry</span>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                No results found. Try adjusting your search criteria.
              </div>
            ) : (
              results.map((e) => {
                const Icon = iconFor(e.type);
                return (
                  <article
                    key={e.id}
                    className="rounded-xl border border-border bg-white p-6 hover:border-secondary hover:shadow-lg transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 rounded-md bg-light-blue text-primary grid place-items-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-secondary bg-light-blue/50 px-2 py-1 rounded">
                        <BadgeCheck className="h-3 w-3" /> Active
                      </span>
                    </div>
                    <h3 className="mt-4 font-semibold text-navy">{e.name}</h3>
                    <div className="mt-1 text-xs text-muted-foreground">{e.type}</div>
                    <div className="mt-3 flex items-center gap-1.5 text-sm text-navy">
                      <MapPin className="h-3.5 w-3.5 text-secondary" /> {e.country}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {e.standards.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-mono px-2 py-1 bg-soft-gray rounded text-primary"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted-foreground">{e.id}</span>
                      <button className="text-xs font-semibold text-secondary hover:text-primary">
                        View →
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>
    </>
  );
}
