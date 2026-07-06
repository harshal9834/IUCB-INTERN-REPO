// ─── AccreditationCTA Component ──────────────────────────────────────────────
// Dynamic right-side CTA panel for the Accreditation Programs section.
//
// - Reads content entirely from accreditation-cta.config.ts
// - No hardcoded strings, no switch statements, no duplicate JSX
// - Framer Motion animation on tab change (CTA card only)
// - Fully accessible (aria-labels, keyboard navigation)
// - Memoized to avoid unnecessary re-renders
// ─────────────────────────────────────────────────────────────────────────────

import { memo } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowRight, Download } from "lucide-react";

import { accreditationCTA } from "../config/accreditation-cta.config";
import { downloadGuide } from "../utils/download-guide";
import type { AccreditationCTAConfig } from "../types/accreditation";

// ─── Animation Variants ───────────────────────────────────────────────────────

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface AccreditationCTAProps {
  /** The active tab ID — must be a key in accreditationCTA config */
  activeTab: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AccreditationCTA = memo(function AccreditationCTA({
  activeTab,
}: AccreditationCTAProps) {
  // Safely resolve config; fall back to first entry if key missing
  const cta: AccreditationCTAConfig =
    accreditationCTA[activeTab] ?? Object.values(accreditationCTA)[0];

  const handleDownload = () => {
    downloadGuide(cta.downloadFile);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="sticky top-28 rounded-2xl bg-primary text-primary-foreground p-8 relative overflow-hidden"
      >
        {/* Decorative blurred orb — purely visual */}
        <div
          className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gold/20 blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative">
          {/* ── Badge ────────────────────────────────────────────────────── */}
          <div
            className="inline-flex items-center justify-center rounded-full border border-gold/60 bg-gold/10 px-4 text-[10px] font-bold tracking-[0.18em] uppercase text-gold"
            style={{ height: 30 }}
            aria-label={`Status: ${cta.badge}`}
          >
            {cta.badge}
          </div>

          {/* ── Heading ──────────────────────────────────────────────────── */}
          <h3 className="mt-4 text-xl font-semibold leading-snug">
            {cta.title}
          </h3>

          {/* ── Description ──────────────────────────────────────────────── */}
          <p className="mt-3 text-sm text-white/75 leading-relaxed">
            {cta.description}
          </p>

          {/* ── Buttons ──────────────────────────────────────────────────── */}
          <div className="mt-6 flex flex-col gap-4">
            {/* Primary — TanStack Router navigation */}
            <Link
              to={cta.route as never}
              aria-label={`${cta.primaryButton} — opens application form`}
              className="group flex w-full items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              style={{
                height: 54,
                borderRadius: 16,
                backgroundColor: "#D8A52A",
                color: "#0F2747",
                boxShadow: "0 2px 8px rgba(216,165,42,0.25)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = "#C4941E";
                el.style.transform = "scale(1.02)";
                el.style.boxShadow = "0 6px 20px rgba(216,165,42,0.40)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = "#D8A52A";
                el.style.transform = "scale(1)";
                el.style.boxShadow = "0 2px 8px rgba(216,165,42,0.25)";
              }}
            >
              {cta.primaryButton}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>

            {/* Secondary — PDF download */}
            <button
              type="button"
              onClick={handleDownload}
              aria-label={`Download ${cta.downloadFile}`}
              className="group flex w-full items-center justify-center gap-2 font-semibold text-sm text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
              style={{
                height: 54,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.30)",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.backgroundColor = "rgba(255,255,255,1)";
                el.style.color = "#0F2747";
                el.style.borderColor = "transparent";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.backgroundColor = "transparent";
                el.style.color = "white";
                el.style.borderColor = "rgba(255,255,255,0.30)";
              }}
            >
              <Download className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
              {cta.secondaryButton}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

AccreditationCTA.displayName = "AccreditationCTA";
