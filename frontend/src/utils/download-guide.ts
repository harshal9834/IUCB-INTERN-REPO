// ─── Download Guide Helper ────────────────────────────────────────────────────
// Reusable utility to trigger browser downloads for PDF guides.
//
// All PDFs must be placed in: /public/guides/
// Usage: downloadGuide("Certification Body Accreditation Kit.pdf")
// ─────────────────────────────────────────────────────────────────────────────

/** Base path for all downloadable guide PDFs. */
const GUIDES_BASE_PATH = "/guides/" as const;

/**
 * Programmatically triggers a browser file download for a PDF guide.
 *
 * @param fileName - The exact filename as declared in accreditation-cta.config.ts
 *
 * @example
 * downloadGuide("Certification Body Accreditation Kit.pdf");
 */
export function downloadGuide(fileName: string): void {
  const filePath = `${GUIDES_BASE_PATH}${encodeURIComponent(fileName)}`;

  const anchor = document.createElement("a");
  anchor.href = filePath;
  anchor.download = fileName;
  anchor.setAttribute("aria-hidden", "true");

  // Append, click, then remove — no visible DOM side-effects
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
