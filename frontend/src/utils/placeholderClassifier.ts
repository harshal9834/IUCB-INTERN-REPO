/**
 * Placeholder Classifier & Resolver
 * Enterprise-level placeholder categorization and resolution
 * 
 * Categories:
 * 1. EXCEL - From uploaded Excel file
 * 2. DATABASE - From IUCB database (auto-resolved)
 * 3. SYSTEM - System-generated (auto-generated)
 */

export type PlaceholderCategory = 'EXCEL' | 'DATABASE' | 'SYSTEM';
export type PlaceholderBadgeColor = 'blue' | 'green' | 'purple' | 'orange';

export interface ClassifiedPlaceholder {
  name: string;
  category: PlaceholderCategory;
  requiresMapping: boolean; // True only for EXCEL placeholders
  autoResolvable: boolean; // True for DATABASE and SYSTEM
  description: string;
  examples?: string[];
  badge: PlaceholderBadgeColor;
}

export interface PlaceholderResolution {
  placeholder: string;
  category: PlaceholderCategory;
  value: string | null; // The actual value or null if not resolved
  isResolved: boolean;
  error?: string; // Error message if resolution failed
}

/**
 * DATABASE PLACEHOLDERS
 * These values must be fetched from IUCB database
 */
const DATABASE_PLACEHOLDERS: Record<string, string> = {
  ORGANIZATION_NAME: 'Organization Name from Database',
  REGISTRATION_NUMBER: 'Training Provider Registration Number',
  STANDARD_SCOPE: 'Training Standard Scope',
  TRAINING_PROVIDER: 'Training Provider Name',
  ACCREDITATION_NUMBER: 'Accreditation Number',
  ACCREDITATION_STATUS: 'Accreditation Status',
  CERTIFICATION_BODY: 'Certification Body',
  ORGANIZATION_ADDRESS: 'Organization Address',
  ORGANIZATION_EMAIL: 'Organization Email',
  ORGANIZATION_PHONE: 'Organization Phone',
};

/**
 * SYSTEM GENERATED PLACEHOLDERS
 * These values are generated automatically by the system
 */
const SYSTEM_PLACEHOLDERS: Record<string, string> = {
  ISSUE_DATE: "Today's Date",
  CERTIFICATE_ID: 'Auto-Generated Certificate ID',
  CREDENTIAL_ID: 'Auto-Generated Credential ID',
  QR_CODE: 'Auto-Generated QR Code',
  CERTIFICATE_URL: 'Generated Certificate Verification Link',
  PDF_URL: 'Generated PDF URL',
  GENERATED_TIMESTAMP: 'Campaign Generation Timestamp',
  CAMPAIGN_ID: 'Campaign ID',
  BATCH_NUMBER: 'Batch Number',
  VERIFICATION_CODE: 'Verification Code',
  UNIQUE_ID: 'Unique ID (GUID)',
  TIMESTAMP: 'Current Timestamp',
  YEAR: 'Current Year',
  MONTH: 'Current Month',
  DAY: 'Current Day',
};

/**
 * Classify a placeholder into one of three categories
 */
export function classifyPlaceholder(
  placeholderName: string,
  excelColumns: string[]
): ClassifiedPlaceholder {
  const normalized = placeholderName.toUpperCase().replace(/[-_]/g, '_');

  // Check if it's a DATABASE placeholder
  if (DATABASE_PLACEHOLDERS[normalized]) {
    return {
      name: placeholderName,
      category: 'DATABASE',
      requiresMapping: false,
      autoResolvable: true,
      description: DATABASE_PLACEHOLDERS[normalized],
      badge: 'green',
    };
  }

  // Check if it's a SYSTEM placeholder
  if (SYSTEM_PLACEHOLDERS[normalized]) {
    return {
      name: placeholderName,
      category: 'SYSTEM',
      requiresMapping: false,
      autoResolvable: true,
      description: SYSTEM_PLACEHOLDERS[normalized],
      badge: 'purple',
    };
  }

  // Otherwise it's an EXCEL placeholder
  return {
    name: placeholderName,
    category: 'EXCEL',
    requiresMapping: true,
    autoResolvable: false,
    description: 'From uploaded Excel file',
    badge: 'blue',
  };
}

/**
 * Get badge color based on placeholder type
 */
export function getBadgeColor(category: PlaceholderCategory): PlaceholderBadgeColor {
  switch (category) {
    case 'EXCEL':
      return 'blue';
    case 'DATABASE':
      return 'green';
    case 'SYSTEM':
      return 'purple';
  }
}

/**
 * Classify all placeholders
 */
export function classifyAllPlaceholders(
  placeholders: string[],
  excelColumns: string[]
): ClassifiedPlaceholder[] {
  return placeholders.map(p => classifyPlaceholder(p, excelColumns));
}

/**
 * Get summary by category
 */
export function getCategorySummary(classified: ClassifiedPlaceholder[]) {
  return {
    total: classified.length,
    excel: classified.filter(p => p.category === 'EXCEL').length,
    database: classified.filter(p => p.category === 'DATABASE').length,
    system: classified.filter(p => p.category === 'SYSTEM').length,
  };
}

/**
 * Check if a placeholder is an Excel placeholder
 */
export function isExcelPlaceholder(placeholderName: string): boolean {
  const normalized = placeholderName.toUpperCase().replace(/[-_]/g, '_');
  return !DATABASE_PLACEHOLDERS[normalized] && !SYSTEM_PLACEHOLDERS[normalized];
}

/**
 * Check if a placeholder is a database placeholder
 */
export function isDatabasePlaceholder(placeholderName: string): boolean {
  const normalized = placeholderName.toUpperCase().replace(/[-_]/g, '_');
  return !!DATABASE_PLACEHOLDERS[normalized];
}

/**
 * Check if a placeholder is a system placeholder
 */
export function isSystemPlaceholder(placeholderName: string): boolean {
  const normalized = placeholderName.toUpperCase().replace(/[-_]/g, '_');
  return !!SYSTEM_PLACEHOLDERS[normalized];
}

/**
 * Resolve a placeholder to its actual value
 * This function determines the value based on category and context
 */
export function resolvePlaceholder(
  placeholder: string,
  excelData: Record<string, any>,
  databaseData: Record<string, any>,
  options?: {
    generateId?: () => string;
    generateQRCode?: (data: string) => string;
    getCurrentDate?: () => Date;
  }
): PlaceholderResolution {
  const normalized = placeholder.toUpperCase().replace(/[-_]/g, '_');

  // DATABASE PLACEHOLDERS - Fetch from database
  if (DATABASE_PLACEHOLDERS[normalized]) {
    const value = databaseData[placeholder] || databaseData[normalized] || null;
    return {
      placeholder,
      category: 'DATABASE',
      value: value || null,
      isResolved: !!value,
      error: !value ? `Database field not found: ${placeholder}` : undefined,
    };
  }

  // SYSTEM PLACEHOLDERS - Generate automatically
  if (SYSTEM_PLACEHOLDERS[normalized]) {
    let value: string | null = null;

    switch (normalized) {
      case 'ISSUE_DATE':
      case 'GENERATED_TIMESTAMP':
      case 'TIMESTAMP':
        value = (options?.getCurrentDate?.() || new Date()).toISOString().split('T')[0];
        break;
      case 'YEAR':
        value = new Date().getFullYear().toString();
        break;
      case 'MONTH':
        value = String(new Date().getMonth() + 1).padStart(2, '0');
        break;
      case 'DAY':
        value = String(new Date().getDate()).padStart(2, '0');
        break;
      case 'CERTIFICATE_ID':
      case 'CREDENTIAL_ID':
      case 'UNIQUE_ID':
        value = options?.generateId?.() || `GEN_${Date.now()}`;
        break;
      case 'QR_CODE':
        value = options?.generateQRCode?.(`cert_${Date.now()}`) || `QR_${Date.now()}`;
        break;
      case 'CERTIFICATE_URL':
      case 'PDF_URL':
        value = `https://certs.iucb.org/${options?.generateId?.() || Date.now()}`;
        break;
      case 'CAMPAIGN_ID':
        value = databaseData.campaignId || 'CAMPAIGN_' + Date.now();
        break;
      case 'BATCH_NUMBER':
        value = databaseData.batchNumber || 'BATCH_' + Date.now();
        break;
      case 'VERIFICATION_CODE':
        value = Math.random().toString(36).substring(2, 8).toUpperCase();
        break;
      default:
        value = null;
    }

    return {
      placeholder,
      category: 'SYSTEM',
      value,
      isResolved: !!value,
    };
  }

  // EXCEL PLACEHOLDERS - Get from uploaded Excel data
  const value = excelData[placeholder] || excelData[normalized] || null;
  return {
    placeholder,
    category: 'EXCEL',
    value: value || null,
    isResolved: !!value,
    error: !value ? `Excel field not found: ${placeholder}` : undefined,
  };
}

/**
 * Resolve all placeholders in a template
 */
export function resolveAllPlaceholders(
  placeholders: string[],
  excelData: Record<string, any>,
  databaseData: Record<string, any>,
  options?: Parameters<typeof resolvePlaceholder>[3]
): PlaceholderResolution[] {
  return placeholders.map(p =>
    resolvePlaceholder(p, excelData, databaseData, options)
  );
}

/**
 * Get unresolved placeholders
 */
export function getUnresolvedPlaceholders(resolutions: PlaceholderResolution[]): string[] {
  return resolutions
    .filter(r => !r.isResolved)
    .map(r => r.placeholder);
}

/**
 * Get resolution summary
 */
export function getResolutionSummary(resolutions: PlaceholderResolution[]) {
  const resolved = resolutions.filter(r => r.isResolved).length;
  const unresolved = resolutions.length - resolved;

  return {
    total: resolutions.length,
    resolved,
    unresolved,
    unresolvedList: getUnresolvedPlaceholders(resolutions),
    categories: {
      excel: resolutions.filter(r => r.category === 'EXCEL' && r.isResolved).length,
      database: resolutions.filter(r => r.category === 'DATABASE' && r.isResolved).length,
      system: resolutions.filter(r => r.category === 'SYSTEM' && r.isResolved).length,
    },
  };
}

