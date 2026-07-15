import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, FileText, Download, BookOpen, FileCheck2, Layers, Eye } from "lucide-react";
import { PageHero } from "../components/page-hero";
import { EmptyState } from "../components/reusable-components";

export const Route = createFileRoute("/documentation")({
  head: () => ({
    meta: [
      { title: "Documentation — IUCB" },
      {
        name: "description",
        content:
          "Access IUCB manuals, governance policies, procedures, templates, and corporate materials.",
      },
    ],
  }),
  component: Documentation,
});

const categories = [
  "All Documents",
  "Manuals",
  "Policies",
  "Procedures",
  "Guidance",
  "Templates",
  "Forms",
  "Other"
];

function Documentation() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All Documents");
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/v1/resources/public");
        const data = await res.json();
        if (data.success) {
          setDocs(data.data);
        }
      } catch (err) {
        console.error("Error fetching docs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleDownload = (id: string) => {
    window.open(`http://localhost:5000/api/v1/resources/download/${id}`, "_blank");
  };

  const handleView = (id: string) => {
    window.open(`http://localhost:5000/api/v1/resources/download/${id}?view=true`, "_blank");
  };

  const filtered = docs.filter((d) => {
    const matchesCat = cat === "All Documents" || d.category === cat;
    const matchesQ =
      !q ||
      d.title.toLowerCase().includes(q.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(q.toLowerCase()));
    return matchesCat && matchesQ;
  });

  const activeCategories = new Set(docs.map(d => d.category)).size;

  return (
    <>
      <PageHero
        eyebrow="Official Documentation"
        title={
          <>
            Manuals, Policies & <span className="text-gold">Resources</span>
          </>
        }
        description="Access IUCB manuals, governance policies, procedures, and corporate materials — the foundation of our trust framework."
      />

      <section className="py-12 bg-white border-b border-border">
        <div className="container-x grid sm:grid-cols-3 gap-4">
          {[
            { icon: FileText, v: loading ? "-" : docs.length, l: "Published Documents" },
            { icon: Layers, v: loading ? "-" : activeCategories || 0, l: "Document Categories" },
            { icon: BookOpen, v: 4, l: "Languages Supported" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-border p-5 flex items-center gap-4">
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

      <section className="py-16 bg-soft-gray">
        <div className="container-x">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-white focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-3.5 py-2 rounded-md text-xs font-semibold transition ${
                    cat === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-white border border-border text-navy hover:border-secondary"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-5">
            {loading ? (
               <div className="col-span-2 p-8 text-center text-gray-500">Loading documents...</div>
            ) : filtered.length === 0 ? (
               <div className="col-span-2">
                 <EmptyState
                   title="No Documents Found"
                   description="Check back later or try adjusting your search filters."
                   icon={<FileText className="h-10 w-10" />}
                 />
               </div>
            ) : (
              filtered.map((d) => (
                <article
                  key={d.id}
                  className="rounded-xl border border-border bg-white p-6 hover:border-secondary hover:shadow-lg transition group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="h-11 w-11 rounded-md bg-light-blue text-primary grid place-items-center flex-shrink-0">
                      <FileCheck2 className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary bg-light-blue/40 px-2 py-1 rounded">
                      {d.category}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-navy">{d.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.description || ""}</p>
                  <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                    <div className="text-[11px] font-mono text-muted-foreground">
                      {d.version || "v1.0"} · {d.filetype} · {(d.filesize / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleView(d.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary group-hover:text-primary"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                      <button 
                        onClick={() => handleDownload(d.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary group-hover:text-primary"
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
