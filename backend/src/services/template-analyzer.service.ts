export class TemplateAnalyzerService {
  /**
   * Analyzes an HTML template and automatically detects its type and placeholders.
   */
  public analyze(htmlContent: string, originalFilename: string) {
    const placeholders = this.extractPlaceholders(htmlContent);
    const detectedType = this.detectCertificateType(htmlContent, placeholders, originalFilename);
    const warnings = this.generateWarnings(placeholders, detectedType);

    return {
      detectedType,
      placeholders,
      warnings,
    };
  }

  private extractPlaceholders(html: string): string[] {
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    const placeholders = new Set<string>();
    let match;

    while ((match = regex.exec(html)) !== null) {
      if (match[1]) {
        placeholders.add(match[1].toUpperCase());
      }
    }

    return Array.from(placeholders);
  }

  private detectCertificateType(html: string, placeholders: string[], filename: string): string {
    // Priority 1: Hidden Metadata
    const metaRegex = /<meta\s+name=["']certificate-type["']\s+content=["']([A-Z_]+)["']\s*\/?>/i;
    const metaMatch = html.match(metaRegex);
    if (metaMatch && metaMatch[1]) {
      return metaMatch[1];
    }

    const commentRegex = /<!--\s*TYPE=([A-Z_]+)\s*-->/i;
    const commentMatch = html.match(commentRegex);
    if (commentMatch && commentMatch[1]) {
      return commentMatch[1];
    }

    // Prepare text for Priority 2 & 4
    const htmlLower = html.toLowerCase();
    const filenameLower = filename.toLowerCase();

    // Mapping for heuristics
    const keywords = [
      { type: 'ADVISORY', terms: ['advisory'], requiredPlaceholder: 'CANDIDATE_NAME' },
      { type: 'ORGANIZATION_ACCREDITATION', terms: ['organization', 'inspection body', 'calibration laboratory', 'testing laboratory'], requiredPlaceholder: 'ORGANIZATION_NAME' },
      { type: 'AUDITOR', terms: ['auditor'], requiredPlaceholder: 'AUDITOR_NAME' },
      { type: 'TRAINING_INSTITUTE', terms: ['training institute'], requiredPlaceholder: 'INSTITUTE_NAME' },
    ];

    // Priority 2: Template Title (Check <title> or <h1> for keywords)
    const titleRegex = /<title>(.*?)<\/title>/i;
    const h1Regex = /<h1[^>]*>(.*?)<\/h1>/i;
    const titleMatch = html.match(titleRegex);
    const h1Match = html.match(h1Regex);
    const textToSearch = `${titleMatch ? titleMatch[1] : ''} ${h1Match ? h1Match[1] : ''}`.toLowerCase();

    if (textToSearch) {
      for (const k of keywords) {
        if (k.terms.some(term => textToSearch.includes(term))) {
          return k.type;
        }
      }
    }

    // Priority 3: Placeholder Analysis
    for (const k of keywords) {
      if (placeholders.includes(k.requiredPlaceholder)) {
        return k.type;
      }
    }

    // Priority 4: Filename matching
    for (const k of keywords) {
      if (k.terms.some(term => filenameLower.includes(term))) {
        return k.type;
      }
    }

    // Priority 5: Unknown
    return 'UNCLASSIFIED';
  }

  private generateWarnings(placeholders: string[], type: string): string[] {
    const warnings: string[] = [];
    
    // Core fields every certificate should probably have
    if (!placeholders.includes('CERTIFICATE_ID')) {
      warnings.push('Missing {{CERTIFICATE_ID}} placeholder');
    }
    if (!placeholders.includes('QR_CODE')) {
      warnings.push('Missing {{QR_CODE}} placeholder');
    }

    // Type specific required fields
    if (type === 'ADVISORY' && !placeholders.includes('CANDIDATE_NAME')) {
      warnings.push('Advisory certificates typically require {{CANDIDATE_NAME}}');
    }
    if (type === 'ORGANIZATION_ACCREDITATION' && !placeholders.includes('ORGANIZATION_NAME')) {
      warnings.push('Organization certificates typically require {{ORGANIZATION_NAME}}');
    }
    if (type === 'AUDITOR' && !placeholders.includes('AUDITOR_NAME')) {
      warnings.push('Auditor certificates typically require {{AUDITOR_NAME}}');
    }
    if (type === 'TRAINING_INSTITUTE' && !placeholders.includes('INSTITUTE_NAME')) {
      warnings.push('Training Institute certificates typically require {{INSTITUTE_NAME}}');
    }

    // Valid placeholders (whitelist)
    const validPlaceholders = new Set([
      'CANDIDATE_NAME', 'ORGANIZATION_NAME', 'ACCREDITATION_SCOPE', 'CERTIFICATE_ID',
      'CREDENTIAL_ID', 'REGISTRATION_NUMBER', 'ISSUE_DATE', 'EXPIRY_DATE', 'STANDARD',
      'QR_CODE', 'VERIFICATION_URL', 'AUDITOR_NAME', 'GRADE', 'INSTITUTE_NAME', 
      'DIRECTOR_NAME', 'COURSE'
    ]);

    for (const p of placeholders) {
      if (!validPlaceholders.has(p)) {
        warnings.push(`Unknown field detected: {{${p}}}`);
      }
    }

    return warnings;
  }
}

export const templateAnalyzerService = new TemplateAnalyzerService();
