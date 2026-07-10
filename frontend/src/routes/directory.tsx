import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
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

function Directory() {
  const [certId, setCertId] = useState("IUCB-ACB-0421");

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
            <div className="text-sm text-muted-foreground text-center py-8">
              Directory search functionality is being prepared. Please use the Certificate Verification section above to validate credentials.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
