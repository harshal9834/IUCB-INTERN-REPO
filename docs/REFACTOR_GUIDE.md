# Bulk Email Campaign Module - Logic Refactor Guide

## Overview

Complete refactor of the Bulk Email Campaign module with centralized state management and pure service layer. Preserves UI entirely - only business logic rebuilt.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        UI COMPONENTS                         │
│                    (Completely unchanged)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│            CENTRALIZED STATE MANAGEMENT                     │
│                 useBulkCampaign Hook                        │
│        (Single source of truth for all phases)              │
└──────────────────────────┬──────────────────────────────────┘
                           │
      ┌────────────────────┼────────────────────┐
      │                    │                    │
      ▼                    ▼                    ▼
 ┌────────────┐   ┌───────────────┐   ┌──────────────┐
 │   Hooks    │   │    Services   │   │   Utilities  │
 │ (Thin)     │   │   (Pure Funcs)│   │   (Helpers)  │
 ├────────────┤   ├───────────────┤   └──────────────┘
 │useExcel    │   │excelParsing   │
 │useTemplate │   │templateParsing│
 │useMapping  │   │mapping        │
 │usePreview  │   │preview        │
 │useCampaign │   │               │
 └────────────┘   └───────────────┘
```

## State Structure

### useBulkCampaign State

```typescript
{
  // Phase 1: Excel Upload
  excelFile: File | null
  excelData: ExcelUploadState {
    file: File | null
    metadata: FileMetadata | null
    rawData: Recipient[]
    validationResults: ValidationResult[]
    summary: ValidationSummary | null
    isProcessing: boolean
    error: string | null
    duplicateEmails: Set<string>
  }

  // Phase 2: Template Upload
  templateFile: File | null
  templateData: TemplateUploadState {
    file: File | null
    metadata: TemplateMetadata | null
    htmlContent: string
    placeholders: PlaceholderSummary | null
    isProcessing: boolean
    error: string | null
  }

  // Phase 3: Mapping
  mappingData: MappingState {
    mappings: ColumnPlaceholderMapping[]
    excelColumns: string[]
    placeholders: string[]
    totalPlaceholders: number
    mappedPlaceholders: number
    needsReviewPlaceholders: number
    unmappedPlaceholders: number
    coveragePercentage: number
    isProcessing: boolean
    error: string | null
    searchQuery: string
    filterStatus: 'MAPPED' | 'NEEDS_REVIEW' | 'UNMAPPED' | 'ALL'
    selectedPlaceholder: string | null
  }

  // Phase 4: Preview
  previewData: PreviewState {
    selectedRecipientIndex: number
    htmlContent: string
    previewHtml: string
    replacements: PlaceholderReplacement[]
    totalRecipients: number
    totalPlaceholders: number
    replacedPlaceholders: number
    unmappedPlaceholders: number
    missingValues: number
    zoomLevel: number
    viewMode: 'rendered' | 'raw'
    isProcessing: boolean
    error: string | null
    warnings: string[]
    hasUnreplacedPlaceholders: boolean
  }

  // Phase 5: Configuration
  campaignConfig: CampaignConfiguration {
    campaignName: string
    campaignDescription: string
    emailSubject: string
    senderName: string
    replyToEmail: string
    emailCategory: string
    priority: 'low' | 'medium' | 'high'
    smtpProfile: string
    emailDelay: number
    batchSize: number
    retryCount: number
    generateCertificates: boolean
    attachPdfCertificate: boolean
    saveCertificates: boolean
    trackEmailStatus: boolean
    createAuditLog: boolean
    retryFailedEmails: boolean
  }

  // Workflow
  currentStep: number // 1-5
  isProcessing: boolean
  globalError: string | null
}
```

## Service Layer (Pure Functions)

### excelParsingService
- `parseExcelFile(file)` → {headers, rows, metadata}
- `validateEmail(email)` → boolean
- `normalizeHeader(header)` → string
- `findMatchingHeader(target, candidates)` → string | null
- `calculateStringSimilarity(str1, str2)` → number 0-1
- `isEmailColumn(rows, columnName)` → boolean
- `isNameColumn(columnName)` → boolean
- `isOrganizationColumn(columnName)` → boolean

### templateParsingService
- `extractPlaceholders(html)` → string[]
- `extractPlaceholdersWithDetails(html)` → {name, count, positions}[]
- `classifyPlaceholder(name)` → 'EXCEL' | 'DATABASE' | 'SYSTEM'
- `validateHtml(html)` → string[] (errors)
- `isValidPlaceholderName(name)` → boolean
- `replacePlaceholders(html, mappings)` → string
- `escapeHtml(text)` → string
- `hasPlaceholders(html)` → boolean
- `isValidTemplate(html)` → {isValid, errors, warnings}

### mappingService (CRITICAL)
- `autoDetectMappings(placeholders, columns)` → ColumnPlaceholderMapping[]
- `updateMapping(mappings, placeholder, column)` → ColumnPlaceholderMapping[]
- `getMappingSuggestions(placeholder, columns)` → {column, confidence, reason}[]
- `validateMappings(mappings, columns)` → MappingValidationResult
- `getMappingStatistics(mappings)` → {total, mapped, needsReview, unmapped, coverage}
- `exportMappings(mappings)` → Record<string, string | null>
- `importMappings(saved, currentPlaceholders, columns)` → ColumnPlaceholderMapping[]
- `findMappingConflicts(mappings)` → {column, placeholders}[]

### previewService
- `replacePlaceholders(html, recipient, mappings)` → string
- `generatePreview(html, recipient, mappings)` → {html, replacements, stats}
- `sanitizeHtmlContent(text)` → string
- `isValidPreview(html, recipient)` → boolean
- `getPreviewWarnings(replacements)` → string[]
- `getPreviewQuality(replacements)` → {completeness, coverage, quality, issues}
- `getTextPreview(html, recipient, mappings)` → string
- `validateRecipient(recipient, requiredColumns)` → {isValid, missing, warnings}

## Hook Layer (Thin Wrappers)

### useExcelUpload
- Stateless hook that returns pure functions
- `handleFileSelect(file)` → Promise<ExcelUploadState>
- `getValidRecords(validationResults)` → ValidationResult[]
- `isValid(excelData)` → boolean

### useTemplateUpload
- Stateless hook that returns pure functions
- `handleFileSelect(file)` → Promise<TemplateUploadState>
- `isValid(templateData)` → boolean
- `getPlaceholders(templateData)` → string[]

### useMapping
- Stateless hook that delegates to mappingService
- `initializeMapping()` → {mappings, validation, stats}
- `getSuggestions(placeholder)` → string[]
- `validate(mappings)` → MappingValidationResult
- `getStatistics(mappings)` → {...}

### usePreview
- Stateless hook that delegates to previewService
- `generatePreviewForRecipient(html, recipient, mappings)` → {...}
- `initializePreviewState(html, recipients, mappings)` → PreviewState
- `generateStatistics(html, recipients, mappings)` → {...}

### useBulkCampaign (CENTRAL)
- Provides centralized state for all phases
- Single source of truth
- All operations go through this hook

## Integration Guide

### Step 1: Update Component Imports

```typescript
// OLD
import { useExcelUpload } from '../hooks/useExcelUpload';
import { useTemplateUpload } from '../hooks/useTemplateUpload';

// NEW
import { useBulkCampaign } from '../hooks/useBulkCampaign';
import { useExcelUpload } from '../hooks/useExcelUpload';
import { useTemplateUpload } from '../hooks/useTemplateUpload';
```

### Step 2: Initialize useBulkCampaign

```typescript
function BulkEmailWorkflow() {
  const campaign = useBulkCampaign();
  
  return (
    <div>
      {/* Pass campaign state to components */}
    </div>
  );
}
```

### Step 3: Phase 1 - Excel Upload

```typescript
function ExcelPhase() {
  const campaign = useBulkCampaign();
  const excel = useExcelUpload();
  
  const handleFileSelect = async (file: File) => {
    const excelData = await excel.handleFileSelect(file);
    if (!excelData.error) {
      // Update centralized state
      campaign.uploadExcel(file, excelData);
      
      // Enable next button
      if (excel.isValid(excelData)) {
        campaign.nextStep();
      }
    }
  };
  
  return (
    <div>
      {/* UI remains unchanged */}
    </div>
  );
}
```

### Step 4: Phase 3 - Mapping (NEW LOGIC)

```typescript
function MappingPhase() {
  const campaign = useBulkCampaign();
  const mapping = useMapping(
    campaign.excelData.rawData.length > 0 ? Object.keys(campaign.excelData.rawData[0]) : [],
    campaign.templateData.placeholders?.unique || []
  );
  
  // Initialize mappings on mount
  useEffect(() => {
    const { mappings, validation } = mapping.initializeMapping();
    campaign.setMappingData({
      ...campaign.mappingData,
      mappings,
    });
  }, []);
  
  // Update mapping when user changes it
  const handleMappingChange = (placeholder: string, column: string | null) => {
    const updatedMappings = mappingService.updateMapping(
      campaign.mappingData.mappings,
      placeholder,
      column
    );
    const validation = mapping.validate(updatedMappings);
    
    campaign.setMappingData({
      ...campaign.mappingData,
      mappings: updatedMappings,
      // Update statistics
    });
  };
}
```

### Step 5: Phase 4 - Preview (NEW LOGIC)

```typescript
function PreviewPhase() {
  const campaign = useBulkCampaign();
  const preview = usePreview();
  
  // Initialize preview
  useEffect(() => {
    if (campaign.excelData.rawData.length > 0 && campaign.templateData.htmlContent) {
      const previewState = preview.initializePreviewState(
        campaign.templateData.htmlContent,
        campaign.excelData.rawData,
        campaign.mappingData.mappings
      );
      campaign.setPreviewData(previewState);
    }
  }, [campaign.excelData, campaign.templateData, campaign.mappingData]);
  
  // Switch recipient
  const handleRecipientSwitch = (index: number) => {
    campaign.selectRecipient(index);
    
    const recipient = campaign.excelData.rawData[index];
    const { previewHtml, replacements, warnings } = preview.generatePreviewForRecipient(
      campaign.templateData.htmlContent,
      recipient,
      campaign.mappingData.mappings
    );
    
    campaign.setPreviewData({
      ...campaign.previewData,
      selectedRecipientIndex: index,
      previewHtml,
      replacements,
      warnings,
    });
  };
}
```

## Validation Changes

### OLD RULE (REMOVED)
- All placeholders must be mapped to proceed

### NEW RULE (ADDED)
- At least ONE EXCEL placeholder must be mapped → Enable Next
- DATABASE and SYSTEM placeholders are auto-resolved
- Show warnings for unmapped but allow continuation

```typescript
const canProceed = 
  campaign.mappingData.mappedPlaceholders > 0 ||
  campaign.mappingData.mappingData.autoResolved > 0;
```

## Testing Checklist

- [ ] Upload Excel file → Validates headers and rows
- [ ] Upload Template → Extracts placeholders correctly
- [ ] Auto-mapping → Matches obvious columns (name, email)
- [ ] Manual mapping → Updates live without rerenders
- [ ] Preview → Renders correctly with replaced values
- [ ] Campaign config → Validates required fields
- [ ] NO CONSOLE ERRORS
- [ ] Memory usage stable (no leaks)
- [ ] Navigation between steps works
- [ ] State persists when going back/forward

## Performance Notes

1. **Zero unnecessary rerenders**: Each hook returns pure functions
2. **No instance state in services**: All functions are pure
3. **Memoized dependencies**: Components can use useMemo effectively
4. **Efficient filtering**: Inline computed properties with useMemo
5. **Debounced search**: Implement in mapping component if needed

## Breaking Changes

None! UI is completely preserved. Only backend logic changed.

## Migration Path

1. Create new services (done)
2. Create new centralized hook (done)
3. Refactor individual hooks (done)
4. Update components incrementally (use campaign state alongside old hooks)
5. Remove old hooks when components updated
6. Remove old utilities when fully migrated

## Files Created

- `/hooks/useBulkCampaign.ts` - Centralized state management
- `/services/excelParsingService.ts` - Pure Excel parsing
- `/services/templateParsingService.ts` - Pure template parsing
- `/services/mappingService.ts` - Pure mapping logic (CRITICAL)
- `/services/previewService.ts` - Pure preview generation

## Files Modified

- `/hooks/useExcelUpload.ts` - Stateless, uses excelParsingService
- `/hooks/useTemplateUpload.ts` - Stateless, uses templateParsingService
- `/hooks/useMapping.ts` - Stateless, uses mappingService
- `/hooks/usePreview.ts` - Stateless, uses previewService

## Old Files (Can be deprecated)

- `/utils/excelParser.ts`
- `/utils/templateParser.ts`
- `/utils/placeholderDetector.ts`
- `/utils/MappingEngine.ts`
- `/utils/PreviewEngine.ts`
- `/utils/placeholderReplacer.ts`
- `/utils/placeholderClassifier.ts`

(Keep during transition, remove after all components migrated)
