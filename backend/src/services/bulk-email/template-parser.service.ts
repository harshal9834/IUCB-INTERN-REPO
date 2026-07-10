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

    return Array.from(placeholders);
  }

  /**
   * Compares extracted placeholders with Excel columns and returns a mapping summary
   */
  public matchPlaceholders(
    placeholders: string[], 
    excelColumns: string[]
  ): { 
    matched: string[], 
    systemGenerated: string[], 
    missing: string[] 
  } {
    // These are predefined system fields that we will generate
    const systemFields = [
      'Credential ID',
      'Certificate ID',
      'Registration Number',
      'Verification Token',
      'Verification URL',
      'QR_CODE',
      'Issue Date',
      'Expiry Date',
      'Certificate Status',
      'Campaign ID',
      'Created Date',
      'Created Time'
    ].map(f => f.toLowerCase());

    const excelColumnsLower = excelColumns.map(c => c.toLowerCase());
    
    const matched: string[] = [];
    const systemGenerated: string[] = [];
    const missing: string[] = [];

    for (const placeholder of placeholders) {
      const placeholderLower = placeholder.toLowerCase();
      
      if (excelColumnsLower.includes(placeholderLower)) {
        matched.push(placeholder);
      } else if (systemFields.includes(placeholderLower)) {
        systemGenerated.push(placeholder);
      } else {
        missing.push(placeholder);
      }
    }

    return { matched, systemGenerated, missing };
  }
}

export const templateParserService = new TemplateParserService();
