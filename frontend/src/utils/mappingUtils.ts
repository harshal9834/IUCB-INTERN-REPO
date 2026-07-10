/**
 * Mapping Utilities - ENHANCED & FIXED
 * String normalization, matching algorithms, and confidence calculation
 * IMPROVEMENTS:
 * - Accurate placeholder matching
 * - Better confidence scoring
 * - Expanded alias mappings
 * - Only matches with confidence >= 70
 */

/**
 * Normalize string for comparison
 * Converts to lowercase, removes spaces, underscores, hyphens, plurals
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    // Remove common suffixes
    .replace(/s$/, '') // Remove trailing 's' for plurals
    // Replace spaces, underscores, hyphens with empty string
    .replace(/[\s_-]/g, '')
    // Remove special characters except alphanumeric
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Extract words from a string (splits on camelCase, spaces, underscores, hyphens)
 */
export function extractWords(str: string): string[] {
  return str
    .split(/[\s_-]+/) // Split on spaces, underscores, hyphens
    .flatMap(word =>
      // Split camelCase: "candidateName" -> ["candidate", "Name"]
      word.split(/(?=[A-Z])/)
    )
    .filter(w => w.length > 0)
    .map(w => w.toLowerCase());
}

/**
 * Get common aliases for a placeholder
 * Expanded list for better matching
 */
export function getPlaceholderAliases(placeholder: string): string[] {
  const normalized = normalizeString(placeholder);
  const aliases: Set<string> = new Set();

  // Add normalized version
  aliases.add(normalized);

  // Split by underscore and try combinations
  const parts = placeholder.split('_');
  if (parts.length > 1) {
    // Each part as alias
    parts.forEach(part => aliases.add(normalizeString(part)));
    
    // Combined parts
    aliases.add(normalizeString(parts.join('')));
  }

  // Common alias mappings - EXPANDED
  const commonAliases: Record<string, string[]> = {
    candidatename: ['student', 'participant', 'recipient', 'name', 'candidate', 'fullname', 'full_name', 'fname', 'lname'],
    email: ['emailaddress', 'emailid', 'mail', 'contact', 'email_address', 'emailadd', 'e_mail', 'email_id'],
    institutename: ['institute', 'organization', 'org', 'school', 'college', 'university', 'institute_name', 'org_name', 'company'],
    course: ['coursename', 'program', 'programname', 'training', 'trainingname', 'subject', 'course_name', 'program_name'],
    issuedate: ['date', 'issued', 'generateddate', 'dateissued', 'issue_date', 'issued_date', 'generation_date', 'dateofissue'],
    credentialid: ['credential', 'credno', 'reference', 'refno', 'id', 'credential_id', 'credential_number', 'cred_number'],
    certificatenumber: ['certificate', 'certno', 'certificateno', 'number', 'cert_number', 'cert_no', 'certid', 'cert_id'],
    trainer: ['instructor', 'facilitator', 'teacher', 'author', 'creator', 'trainer_name', 'instructor_name'],
    duration: ['length', 'hours', 'days', 'duration_hours', 'duration_days', 'traininghours'],
    score: ['grade', 'marks', 'percentage', 'points', 'score_percentage', 'percentage_score'],
    phone: ['phone_number', 'phonenumber', 'mobile', 'contact_number', 'telephone', 'phone_no', 'mobile_number'],
    city: ['city_name', 'location', 'town'],
    country: ['country_name', 'nation'],
    state: ['state_name', 'province', 'region'],
    address: ['physical_address', 'full_address'],
    organization: ['organization_name', 'org_name', 'company_name', 'organization'],
  };

  if (commonAliases[normalized]) {
    commonAliases[normalized].forEach(alias => aliases.add(normalizeString(alias)));
  }

  return Array.from(aliases);
}

/**
 * IMPROVED: Calculate match confidence between column name and placeholder
 * Uses multiple matching strategies
 * Returns: 100 (exact), 90 (alias), 80 (words match), 70 (partial), 60 (substring), 0 (no match)
 */
export function calculateMatchConfidence(
  columnName: string,
  placeholder: string
): { confidence: 0 | 10 | 30 | 50 | 60 | 70 | 80 | 90 | 100; reason: string } {
  const normalizedColumn = normalizeString(columnName);
  const normalizedPlaceholder = normalizeString(placeholder);

  // 1. EXACT MATCH (highest confidence)
  if (normalizedColumn === normalizedPlaceholder) {
    return {
      confidence: 100,
      reason: 'Exact match',
    };
  }

  // 2. ALIAS MATCH (very high confidence)
  const aliases = getPlaceholderAliases(placeholder);
  if (aliases.includes(normalizedColumn)) {
    return {
      confidence: 90,
      reason: 'Alias match',
    };
  }

  // 3. WORD-BY-WORD MATCH (high confidence)
  const columnWords = extractWords(columnName);
  const placeholderWords = extractWords(placeholder);
  
  const matchedWords = placeholderWords.filter(pword =>
    columnWords.some(cword => cword === pword && pword.length > 1)
  );
  
  if (matchedWords.length === placeholderWords.length && placeholderWords.length > 0) {
    // All words in placeholder matched in column
    return {
      confidence: 80,
      reason: 'All words matched',
    };
  }

  if (matchedWords.length > 0 && matchedWords.length >= Math.ceil(placeholderWords.length / 2)) {
    // Majority of words matched
    return {
      confidence: 70,
      reason: `${matchedWords.length}/${placeholderWords.length} words matched`,
    };
  }

  // 4. SUBSTRING MATCH (moderate confidence)
  if (
    normalizedColumn.includes(normalizedPlaceholder) ||
    normalizedPlaceholder.includes(normalizedColumn)
  ) {
    return {
      confidence: 60,
      reason: 'Substring match',
    };
  }

  // 5. SINGLE WORD OVERLAP (low confidence) - only if word is > 3 chars
  const singleWordOverlap = columnWords.some(word =>
    placeholderWords.some(pword => word === pword && word.length > 3)
  );

  if (singleWordOverlap) {
    return {
      confidence: 50,
      reason: 'Word overlap (longer word)',
    };
  }

  // NO MATCH
  return {
    confidence: 0,
    reason: 'No match',
  };
}

/**
 * IMPROVED: Find best match for a placeholder from available columns
 * Returns highest confidence match or null if no good match
 */
export function findBestMatch(
  placeholder: string,
  excelColumns: string[]
): { column: string | null; confidence: 0 | 10 | 30 | 50 | 60 | 70 | 80 | 90 | 100; reason: string } {
  let bestMatch = {
    column: null as string | null,
    confidence: 0 as 0 | 10 | 30 | 50 | 60 | 70 | 80 | 90 | 100,
    reason: 'No match',
  };

  for (const column of excelColumns) {
    const result = calculateMatchConfidence(column, placeholder);
    if (result.confidence > bestMatch.confidence) {
      bestMatch = {
        column,
        confidence: result.confidence,
        reason: result.reason,
      };
    }
    // If we found an exact match, no need to continue
    if (result.confidence === 100) {
      break;
    }
  }

  return bestMatch;
}

/**
 * Auto-match all placeholders to Excel columns
 * Only matches if confidence >= 70 (high confidence)
 * Otherwise requires manual mapping
 */
export function autoMatchPlaceholders(
  placeholders: string[],
  excelColumns: string[]
): Array<{ placeholder: string; column: string | null; confidence: 0 | 10 | 30 | 50 | 60 | 70 | 80 | 90 | 100; reason: string }> {
  return placeholders.map(placeholder => {
    const match = findBestMatch(placeholder, excelColumns);
    // Only return match if confidence is high (>= 70)
    // Otherwise return null column to require manual mapping
    if (match.confidence >= 70) {
      return {
        placeholder,
        ...match,
      };
    } else {
      return {
        placeholder,
        column: null,
        confidence: 0,
        reason: 'No high-confidence match - requires manual mapping',
      };
    }
  });
}

/**
 * Validate mapping completeness
 */
export function validateMapping(
  mappings: Array<{ placeholderName: string; excelColumnName: string | null }>
): {
  isComplete: boolean;
  unmappedCount: number;
  unmappedPlaceholders: string[];
} {
  const unmapped = mappings.filter(m => !m.excelColumnName);
  
  return {
    isComplete: unmapped.length === 0,
    unmappedCount: unmapped.length,
    unmappedPlaceholders: unmapped.map(m => m.placeholderName),
  };
}

/**
 * Calculate coverage percentage
 */
export function calculateCoverage(
  mappedCount: number,
  totalCount: number
): number {
  if (totalCount === 0) return 0;
  return Math.round((mappedCount / totalCount) * 100);
}

/**
 * Get mapping status from confidence
 */
export function getMappingStatus(confidence: number): 'MAPPED' | 'NEEDS_REVIEW' | 'UNMAPPED' | 'AUTO_RESOLVED' {
  if (confidence === 0) return 'UNMAPPED';
  if (confidence >= 90) return 'MAPPED';
  if (confidence >= 70) return 'NEEDS_REVIEW';
  return 'UNMAPPED';
}

/**
 * Sort mappings by status (MAPPED first, then NEEDS_REVIEW, then UNMAPPED, then AUTO_RESOLVED)
 */
export function sortMappingsByStatus(
  mappings: Array<{ status: 'MAPPED' | 'NEEDS_REVIEW' | 'UNMAPPED' | 'AUTO_RESOLVED'; confidence: number }>
): typeof mappings {
  const statusOrder = { MAPPED: 0, AUTO_RESOLVED: 1, NEEDS_REVIEW: 2, UNMAPPED: 3 };
  
  return [...mappings].sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return b.confidence - a.confidence;
  });
}

/**
 * Filter mappings by search query
 */
export function filterMappingsBySearch(
  mappings: Array<{ placeholderName: string; excelColumnName: string | null }>,
  query: string
): typeof mappings {
  if (!query.trim()) return mappings;
  
  const normalized = query.toLowerCase();
  return mappings.filter(m =>
    m.placeholderName.toLowerCase().includes(normalized) ||
    m.excelColumnName?.toLowerCase().includes(normalized)
  );
}

/**
 * Filter mappings by status
 */
export function filterMappingsByStatus(
  mappings: Array<{ status: 'MAPPED' | 'NEEDS_REVIEW' | 'UNMAPPED' | 'AUTO_RESOLVED' }>,
  status: 'MAPPED' | 'NEEDS_REVIEW' | 'UNMAPPED' | 'AUTO_RESOLVED' | 'ALL'
): typeof mappings {
  if (status === 'ALL') return mappings;
  return mappings.filter(m => m.status === status);
}

/**
 * Generate preview value
 */
export function formatPlaceholderForPreview(placeholderName: string): string {
  return `{{${placeholderName}}}`;
}

/**
 * Get suggestion list for a placeholder
 * Returns array of possible Excel columns, sorted by confidence
 */
export function getSuggestionsForPlaceholder(
  placeholder: string,
  excelColumns: string[]
): string[] {
  const suggestions = excelColumns
    .map(column => ({
      column,
      confidence: calculateMatchConfidence(column, placeholder).confidence,
    }))
    .filter(item => item.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .map(item => item.column);

  // Return suggestions or first 5 columns if no suggestions
  return suggestions.length > 0 ? suggestions : excelColumns.slice(0, 5);
}
