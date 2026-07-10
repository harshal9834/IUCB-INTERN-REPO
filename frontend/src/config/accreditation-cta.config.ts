// ─── Accreditation CTA Configuration ─────────────────────────────────────────
// Single source of truth for all right-side CTA panel content.
//
// TO ADD A NEW PROGRAM:
//   1. Add a new key matching the tab `id` in services.tsx
//   2. Fill the AccreditationCTAConfig fields
//   3. That's it — no component changes required.
// ─────────────────────────────────────────────────────────────────────────────

import type { AccreditationCTAConfig } from "../types/accreditation";

export const accreditationCTA: Record<string, AccreditationCTAConfig> = {
  /** ── Program 1: Certification Bodies ──────────────────────────────────── */
  cb: {
    badge: "GET STARTED",
    title: "Begin Your Accreditation Journey with IUCB",
    description:
      "Our accreditation specialists are ready to guide your Certification Body through every step of the accreditation process and help you achieve internationally recognized accreditation.",
    primaryButton: "Apply for Accreditation",
    route: "/apply/accreditation",
    secondaryButton: "Application Kit",
    downloadFile: "Certification Body Accreditation Kit.pdf",
  },

  /** ── Program 2: Individual Auditors ───────────────────────────────────── */
  auditors: {
    badge: "GET CERTIFIED",
    title: "Become an IUCB Accredited Auditor",
    description:
      "Showcase your auditing expertise with IUCB accreditation. Our specialists will guide you through eligibility verification, competency assessment, documentation and certification, helping you gain international recognition as a professional auditor.",
    primaryButton: "Apply as Auditor",
    route: "/apply/auditor",
    secondaryButton: "Auditor Application Guide",
    downloadFile: "Individual Auditor Guide.pdf",
  },

  /** ── Program 3: Training Providers ────────────────────────────────────── */
  training: {
    badge: "START TODAY",
    title: "Accredit Your Training Organization",
    description:
      "Strengthen the credibility of your training institution through IUCB accreditation. Our experts will assist you in meeting international quality standards, improving learner confidence and achieving global recognition for your training programs.",
    primaryButton: "Apply as Training Provider",
    route: "/apply/training-institute",
    secondaryButton: "Training Provider Guide",
    downloadFile: "Training Provider Accreditation Guide.pdf",
  },

  /** ── Program 4: Advisory Board ─────────────────────────────────────────── */
  advisory: {
    badge: "JOIN US",
    title: "Shape Global Accreditation Standards",
    description:
      "Join IUCB's Advisory Board to provide strategic guidance, influence policy direction, and contribute to international best practices. Share your expertise at the highest level.",
    primaryButton: "Join Advisory Board",
    route: "/apply/advisory",
    secondaryButton: "Advisory Charter",
    downloadFile: "IUCB Advisory Charter.pdf",
  },
} as const satisfies Record<string, AccreditationCTAConfig>;
