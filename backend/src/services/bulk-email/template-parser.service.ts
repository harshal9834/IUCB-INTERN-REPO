// ============================================================
// Template Parser Service
// Extracts {{placeholders}} from HTML templates and matches
// them against available Excel columns + system-generated fields.
// ============================================================

// ─── Canonical key normalisation ─────────────────────────────────────────────
//
// Converts any casing/separator variant to a stable canonical key used
// purely for MATCHING purposes (never displayed to the user).
//
// Examples that all map to the same canonical key:
//   CANDIDATE_NAME  →  candidatename
//   Candidate Name  →  candidatename
//   candidate_name  →  candidatename
//   candidateName   →  candidatename
//   CandidateName   →  candidatename
//
function canonicalKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[\s_\-]/g, '');   // strip spaces, underscores, hyphens
}

export class TemplateParserService {
  /**
   * Extracts all placeholders enclosed in double curly braces {{Placeholder}}
   */
  public extractPlaceholders(html: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const placeholders = new Set<string>();
    let match;

    while ((match = regex.exec(html)) !== null) {
      placeholders.add(match[1].trim());
    }

    const result = Array.from(placeholders);
    console.log('[TemplateParsing] Extracted placeholders:', result);
    return result;
  }

  /**
   * Matches template placeholders against available Excel columns and
   * system-generated fields.
   *
   * Matching is FLEXIBLE:
   *   - Case-insensitive
   *   - Ignores spaces, underscores, hyphens
   *   - So {{CANDIDATE_NAME}} matches column "Candidate Name" or "candidateName"
   */
  public matchPlaceholders(
    placeholders: string[],
    excelColumns: string[],
  ): {
    matched: string[];
    systemGenerated: string[];
    missing: string[];
  } {
    // System-generated fields (canonical keys for comparison)
    const systemFieldCanonicals = new Set<string>([
      'credentialid',
      'certificateid',
      'registrationnumber',
      'verificationtoken',
      'verificationurl',
      'qrcode',
      'qr_code',         // alias kept for legacy templates
      'issuedate',
      'expirydate',
      'certificatestatus',
      'campaignid',
      'createddate',
      'createdtime',
    ]);

    // Build canonical → original map for Excel columns
    // (keeps first occurrence wins if duplicates exist)
    const excelCanonicalMap = new Map<string, string>();
    for (const col of excelColumns) {
      const canon = canonicalKey(col);
      if (!excelCanonicalMap.has(canon)) {
        excelCanonicalMap.set(canon, col);
      }
    }

    console.log('[TemplateParsing] Excel columns received:', excelColumns);
    console.log('[TemplateParsing] Excel canonical keys:', [...excelCanonicalMap.keys()]);

    const matched: string[] = [];
    const systemGenerated: string[] = [];
    const missing: string[] = [];

    for (const placeholder of placeholders) {
      const placeholderCanon = canonicalKey(placeholder);

      console.log(
        `[TemplateParsing] Checking placeholder "${placeholder}" → canonical "${placeholderCanon}"`,
      );

      if (excelCanonicalMap.has(placeholderCanon)) {
        matched.push(placeholder);
        console.log(`  → MATCHED from Excel (column: "${excelCanonicalMap.get(placeholderCanon)}")`);
      } else if (systemFieldCanonicals.has(placeholderCanon)) {
        systemGenerated.push(placeholder);
        console.log('  → SYSTEM GENERATED');
      } else {
        missing.push(placeholder);
        console.log('  → UNRESOLVED / MISSING');
      }
    }

    console.log('[TemplateParsing] Result:', { matched, systemGenerated, missing });
    return { matched, systemGenerated, missing };
  }
}

export const templateParserService = new TemplateParserService();
