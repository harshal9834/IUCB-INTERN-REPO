import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, FileText, Download, BookOpen, FileCheck2, Layers, Eye, SlidersHorizontal } from "lucide-react";
import { PageHero } from "../components/page-hero";
import { EmptyState } from "../components/reusable-components";

export const Route = createFileRoute("/resources/documentation")({
  head: () => ({
    meta: [
      { title: "Documentation Repository — IUCB" },
      {
        name: "description",
        content: "Access official IUCB manuals, governance policies, procedures, templates, and corporate publications.",
      },
    ],
  }),
  component: DocumentationResources,
});

const categories = [
  "All Documents",
  "Governance",
  "Manuals",
  "Policies",
  "Procedures",
  "Standards",
  "Templates",
  "Forms",
  "Public Reports",
];

const fallbackDocs = [
  {
    id: "doc-01",
    title: "IUCB Code of Conduct",
    description: "Ethical guidelines, professional integrity obligations, and impartiality rules for all accredited entities and certified professionals.",
    category: "Governance",
    version: "v3.0",
    date: "Jan 2025",
    filetype: "PDF",
    filesize: 1420000,
  },
  {
    id: "doc-02",
    title: "Appeals and Complaints Procedure",
    description: "The formal 7-step process for lodging and resolving grievances regarding accreditation decisions and certified entity operations.",
    category: "Procedures",
    version: "v2.5",
    date: "Dec 2024",
    filetype: "PDF",
    filesize: 1180000,
  },
  {
    id: "doc-03",
    title: "Fee Structure 2026",
    description: "Transparent breakdown of application fees, on-site assessment costs, annual surveillance, and certificate maintenance fees.",
    category: "Governance",
    version: "v2026.1",
    date: "Jan 2026",
    filetype: "PDF",
    filesize: 890000,
  },
  {
    id: "doc-04",
    title: "ISO/IEC 27001 Transition Guide",
    description: "Advisory documentation and guidance for certification bodies and organizations migrating to the latest ISMS standard revision.",
    category: "Standards",
    version: "v4.2",
    date: "Nov 2024",
    filetype: "PDF",
    filesize: 2300000,
  },
  {
    id: "doc-05",
    title: "Certification Body Application Pack",
    description: "Complete application manual, documentation checklist, and quality manual requirements for ISO/IEC 17021-1 accreditation.",
    category: "Forms",
    version: "v5.0",
    date: "Jan 2025",
    filetype: "ZIP",
    filesize: 3100000,
  },
  {
    id: "doc-06",
    title: "Auditor Certification Application Form",
    description: "Application form, CV template, audit log sheet, and prerequisite guidelines for Associate, Auditor, and Lead Auditor tiers.",
    category: "Templates",
    version: "v3.1",
    date: "Sep 2024",
    filetype: "DOCX",
    filesize: 1650000,
  },
  {
    id: "doc-07",
    title: "ISO/IEC 17011 Quality Manual Template",
    description: "Standardized quality manual template aligned with international accreditation body governance benchmarks.",
    category: "Manuals",
    version: "v2.0",
    date: "Aug 2024",
    filetype: "DOCX",
    filesize: 2750000,
  },
  {
    id: "doc-08",
    title: "Annual Governance & Impartiality Report 2025",
    description: "Public disclosure report summarizing annual audit pass rates, oversight council reviews, and impartiality risk assessments.",
    category: "Public Reports",
    version: "v2025.F",
    date: "Dec 2025",
    filetype: "PDF",
    filesize: 4200000,
  },
];

function DocumentationResources() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All Documents");
  const [docType, setDocType] = useState("All Types");
  const [sortBy, setSortBy] = useState("Latest");
  const [docs, setDocs] = useState<any[]>(fallbackDocs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const catParam = searchParams.get("cat");
      if (catParam) {
        const found = categories.find(
          (c) => c.toLowerCase() === catParam.toLowerCase() || c.toLowerCase().includes(catParam.toLowerCase())
        );
        if (found) setCat(found);
      }
    }

    const fetchDocs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/resources/public");
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setDocs(data.data);
        }
      } catch (err) {
        console.error("Error fetching docs, using fallback", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleDownload = (doc: any) => {
    if (doc.id.startsWith("doc-")) {
      alert(`Downloading ${doc.title} (${doc.filetype})...`);
    } else {
      window.open(`http://localhost:5000/api/v1/resources/download/${doc.id}`, "_blank");
    }
  };

  const handleView = (doc: any) => {
    if (doc.id.startsWith("doc-")) {
      alert(`Previewing ${doc.title} (${doc.version})...`);
    } else {
      window.open(`http://localhost:5000/api/v1/resources/download/${doc.id}?view=true`, "_blank");
    }
  };

  // Filtering & Sorting
  const filtered = docs
    .filter((d) => {
      const matchesCat = cat === "All Documents" || d.category?.toLowerCase() === cat.toLowerCase();
      const matchesType = docType === "All Types" || d.filetype?.toLowerCase() === docType.toLowerCase();
      const matchesQ =
        !q ||
        d.title.toLowerCase().includes(q.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(q.toLowerCase()));
      return matchesCat && matchesType && matchesQ;
    })
    .sort((a, b) => {
      if (sortBy === "Alphabetical") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "Category") {
        return (a.category || "").localeCompare(b.category || "");
      }
      // Default: Latest / Date sort
      return (b.date || "").localeCompare(a.date || "");
    });

  const activeCategories = new Set(docs.map((d) => d.category)).size;

  return (
    <>
      <PageHero
        eyebrow="Official Documentation Repository"
        title={
          <>
            Documentation <span className="text-gold">Center</span>
          </>
        }
        description="Search and download manuals, operational forms, standards alignment policies, and technical publications."
      />

      {/* METRICS ROW */}
      <section className="py-12 bg-white border-b border-border">
        <div className="container-x grid sm:grid-cols-3 gap-4">
          {[
            { icon: FileText, v: docs.length, l: "Published Documents" },
            { icon: Layers, v: activeCategories || 8, l: "Document Categories" },
            { icon: BookOpen, v: 4, l: "Supported Languages" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-border p-5 flex items-center gap-4 bg-card">
              <div className="h-10 w-10 rounded-md bg-light-blue text-primary grid place-items-center">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-primary">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEARCH AND FILTERS */}
      <section className="py-16 bg-soft-gray min-h-screen">
        <div className="container-x">
          <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-sm font-medium"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-xs font-semibold text-navy">
                <SlidersHorizontal className="h-4 w-4 opacity-70" /> Filter By:
              </div>
              
              {/* Category selector */}
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="bg-white border border-border rounded-lg text-xs font-semibold p-2.5 outline-none focus:border-secondary"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* Doc Type selector */}
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="bg-white border border-border rounded-lg text-xs font-semibold p-2.5 outline-none focus:border-secondary"
              >
                {["All Types", "PDF", "DOCX", "ZIP"].map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* Sort By selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-border rounded-lg text-xs font-semibold p-2.5 outline-none focus:border-secondary"
              >
                {["Latest", "Alphabetical", "Category"].map((sort) => (
                  <option key={sort} value={sort}>Sort: {sort}</option>
                ))}
              </select>
            </div>
          </div>

          {/* GRID OF DOCUMENTS */}
          <div className="mt-8 grid md:grid-cols-2 gap-5">
            {filtered.length === 0 ? (
              <div className="col-span-2">
                <EmptyState
                  title="No Documents Found"
                  description="Try adjusting your filters or search keywords."
                  icon={<FileText className="h-10 w-10" />}
                />
              </div>
            ) : (
              filtered.map((d) => (
                <article
                  key={d.id}
                  className="rounded-xl border border-border bg-white p-6 hover:border-secondary hover:shadow-lg transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="h-11 w-11 rounded-md bg-light-blue text-primary grid place-items-center flex-shrink-0">
                        <FileCheck2 className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary bg-light-blue/40 px-2 py-1 rounded">
                        {d.category}
                      </span>
                    </div>
                    <h3 className="mt-4 font-bold text-navy text-base leading-snug">{d.title}</h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{d.description || ""}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <div className="text-[11px] font-mono text-muted-foreground">
                      {d.version || "v1.0"} · {d.filetype || "PDF"} · {typeof d.filesize === "number" ? (d.filesize / 1024 / 1024).toFixed(2) : "1.2"} MB
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleView(d)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary group-hover:text-primary transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button
                        onClick={() => handleDownload(d)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary group-hover:text-primary transition"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
