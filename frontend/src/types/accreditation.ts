// ─── AccreditationCTA Types ──────────────────────────────────────────────────
// Strict TypeScript interface for the right-side CTA panel.
// All fields are required — no optional loose typing.
// ─────────────────────────────────────────────────────────────────────────────

export interface AccreditationCTAConfig {
  /** Short uppercase badge label, e.g. "GET STARTED" */
  badge: string;

  /** Main heading displayed prominently in the CTA card */
  title: string;

  /** Supporting paragraph beneath the heading */
  description: string;

  /** Primary call-to-action button label */
  primaryButton: string;

  /** TanStack Router internal route for the primary button */
  route: string;

  /** Secondary button label shown next to the download icon */
  secondaryButton: string;

  /** Filename of the PDF stored in /public/guides/ */
  downloadFile: string;
}

/**
 * Map of TabId → AccreditationCTAConfig.
 * Strongly typed so that every tab must have a corresponding CTA config.
 */
export type AccreditationCTAMap<T extends string> = Record<T, AccreditationCTAConfig>;
