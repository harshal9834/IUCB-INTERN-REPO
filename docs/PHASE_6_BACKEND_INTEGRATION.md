# Phase 6 - Frontend to Backend Integration Guide

## Overview
The backend is now ready to receive campaign data from the frontend wizard. This guide explains how to integrate the frontend with the backend `/start` endpoint.

---

## Endpoint Details

### POST /api/v1/training-institutes/bulk-email/start

**Purpose:** Create a new bulk email campaign with recipients

**Authentication:** Required (JWT token in Authorization header)

**Base URL:** `http://localhost:3000/api` (or your backend URL)

---

## Request Format

```typescript
// Prepare the complete payload from all 5 phases
const payload: StartBulkEmailCampaignRequest = {
  // Phase 5: Campaign Configuration
  configuration: {
    campaignName: "string",               // *required
    campaignDescription: "string",        // optional
    emailSubject: "string",               // *required
    senderName: "string",                 // *required
    replyToEmail: "string",               // *required (valid email)
    emailCategory: "string",              // optional
    priority: "low" | "medium" | "high",  // *required
    smtpProfile: "string",                // *required (e.g., "default")
    emailDelay: number,                   // in milliseconds (min: 0)
    batchSize: number,                    // emails per batch (min: 1)
    retryCount: number,                   // number of retries (min: 0)
    generateCertificates: boolean,
    attachPdfCertificate: boolean,
    saveCertificates: boolean,
    trackEmailStatus: boolean,
    createAuditLog: boolean,
    retryFailedEmails: boolean
  },

  // Phase 1: Excel Data (valid recipients only)
  recipients: [
    {
      candidateName: "string",    // from Excel column
      email: "string",            // from Excel column
      instituteName: "string"     // from Excel column
    }
    // ... more recipients
  ],

  // Phase 2: Template Upload
  templateName: "string",         // filename, e.g., "Accreditation Template.html"
  templateHtml: "string",         // full HTML content from template file

  // Phase 3: Placeholder Mappings
  mappings: [
    {
      placeholderName: "string",     // e.g., "candidate_name"
      excelColumnName: "string" | null  // e.g., "Candidate Name" or null if unmapped
    }
    // ... one entry per detected placeholder
  ],

  // Phase 2: Detected Placeholders
  detectedPlaceholders: [
    "string",  // e.g., "candidate_name"
    "string"   // e.g., "email"
    // ... all unique placeholder names detected in template
  ]
};
```

---

## Implementation Example

### Using React Query (Recommended)

```typescript
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth'; // Your auth hook
import { StartBulkEmailCampaignResponse } from '@/types/bulk-email.types';

export const useStartCampaign = () => {
  const { token } = useAuth(); // Get JWT token from auth context

  return useMutation({
    mutationFn: async (payload: StartBulkEmailCampaignRequest) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/v1/training-institutes/bulk-email/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start campaign');
      }

      return response.json() as Promise<StartBulkEmailCampaignResponse>;
    },
    onSuccess: (data) => {
      console.log('Campaign created:', data.data.campaignId);
      // Handle success - navigate to confirmation, show toast, etc.
    },
    onError: (error) => {
      console.error('Campaign creation failed:', error);
      // Handle error - show error message to user
    },
  });
};
```

### In Your Wizard Component

```typescript
// In your bulk email wizard component (Step 6 or 7 - "Send Campaign")

import { useStartCampaign } from '@/hooks/useStartCampaign';

function BulkEmailWizard() {
  const excel = useExcelUpload();           // Phase 1 state
  const template = useTemplateUpload();     // Phase 2 state
  const mapping = useMapping(...);          // Phase 3 state
  const preview = usePreview(...);          // Phase 4 state
  const campaign = useCampaignConfiguration(); // Phase 5 state
  const startCampaignMutation = useStartCampaign();

  const handleStartCampaign = async () => {
    // Gather data from all phases
    const payload: StartBulkEmailCampaignRequest = {
      // Phase 5
      configuration: campaign.values,

      // Phase 1 - Only valid recipients
      recipients: excel.validationResults
        .filter(r => r.status === 'VALID')
        .map(r => r.data),

      // Phase 2
      templateName: template.metadata?.name || 'template.html',
      templateHtml: template.htmlContent,

      // Phase 3 - Export mappings from useMapping hook
      mappings: mapping.exportMappings(),

      // Phase 2 - Placeholders detected
      detectedPlaceholders: template.placeholders?.unique || []
    };

    // Call backend API
    startCampaignMutation.mutate(payload);
  };

  return (
    <div>
      {/* Your wizard steps */}
      <button 
        onClick={handleStartCampaign}
        disabled={startCampaignMutation.isPending}
      >
        {startCampaignMutation.isPending ? 'Creating...' : 'Start Campaign'}
      </button>

      {startCampaignMutation.isSuccess && (
        <div className="success-message">
          Campaign created successfully!
          Campaign ID: {startCampaignMutation.data.data.campaignId}
        </div>
      )}

      {startCampaignMutation.isError && (
        <div className="error-message">
          {startCampaignMutation.error.message}
        </div>
      )}
    </div>
  );
}
```

---

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Campaign created successfully with 100 recipients",
  "data": {
    "campaignId": "550e8400-e29b-41d4-a716-446655440000",
    "campaignName": "Summer 2026 Batch",
    "status": "READY",
    "summary": {
      "totalRecipients": 100,
      "validRecipients": 100,
      "invalidRecipients": 0,
      "mappedPlaceholders": 3,
      "detectedPlaceholders": 5
    },
    "recipientCount": 100,
    "createdAt": "2026-07-08T10:30:00.000Z"
  }
}
```

### Error Response (400 - Validation Failed)

```json
{
  "success": false,
  "message": "Campaign validation failed",
  "errors": [
    {
      "field": "campaign",
      "message": "Campaign name is required"
    },
    {
      "field": "campaign",
      "message": "At least one recipient is required"
    }
  ]
}
```

### Error Response (401 - Unauthorized)

```json
{
  "success": false,
  "message": "Unauthorized: Admin authentication required"
}
```

### Error Response (500 - Server Error)

```json
{
  "success": false,
  "message": "Failed to create campaign",
  "error": "Internal server error details..."
}
```

---

## Common Issues & Troubleshooting

### Issue: 401 Unauthorized

**Cause:** Missing or invalid JWT token

**Solution:**
```typescript
// Make sure you're including the token
const headers = {
  'Authorization': `Bearer ${token}`, // NOT just the token
  'Content-Type': 'application/json'
};
```

### Issue: 400 Campaign validation failed

**Cause:** Invalid data in request

**Check:**
- ✅ Campaign name is not empty
- ✅ Email subject is not empty
- ✅ Sender name is not empty
- ✅ Reply-to email is valid format (name@domain.com)
- ✅ At least one recipient in the list
- ✅ All recipients have candidateName, email, instituteName
- ✅ Email format is valid for all recipients
- ✅ No duplicate emails in recipients
- ✅ Template HTML is not empty
- ✅ Priority is 'low', 'medium', or 'high'
- ✅ Batch size is at least 1
- ✅ Email delay is not negative

### Issue: Network Error / CORS

**Cause:** Backend not running or CORS not configured

**Solution:**
```typescript
// Make sure your backend is running
// Check backend/src/app.ts has CORS configured:
const corsConfig = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
};
```

---

## Validation Rules

The backend validates:

1. **Campaign Configuration:**
   - Campaign name: required, non-empty string
   - Email subject: required, non-empty string
   - Sender name: required, non-empty string
   - Reply-to email: required, valid email format
   - Priority: must be 'low', 'medium', or 'high'
   - Email delay: must be number ≥ 0
   - Batch size: must be number ≥ 1
   - Retry count: must be number ≥ 0

2. **Recipients:**
   - At least one recipient required
   - Each recipient must have: candidateName, email, instituteName
   - Emails must be valid format
   - No duplicate emails allowed

3. **Template:**
   - HTML content required (non-empty)
   - Template name required

4. **Mappings:**
   - At least one mapping required
   - Each mapping must have placeholderName
   - excelColumnName can be null (unmapped placeholder)

---

## Best Practices

### 1. **Validation Before Submission**

```typescript
// In your component, validate before calling API
const canSubmit = () => {
  return (
    campaign.values.campaignName.trim().length > 0 &&
    campaign.values.emailSubject.trim().length > 0 &&
    campaign.values.senderName.trim().length > 0 &&
    isValidEmail(campaign.values.replyToEmail) &&
    excel.validationResults.some(r => r.status === 'VALID') &&
    template.htmlContent.length > 0 &&
    mapping.mappings.length > 0
  );
};
```

### 2. **Show Loading State**

```typescript
<button 
  disabled={startCampaignMutation.isPending || !canSubmit()}
  className={startCampaignMutation.isPending ? 'loading' : ''}
>
  {startCampaignMutation.isPending ? (
    <>
      <Spinner /> Creating campaign...
    </>
  ) : (
    'Start Campaign'
  )}
</button>
```

### 3. **Handle Success**

```typescript
// Navigate to campaign confirmation or show success page
if (startCampaignMutation.isSuccess) {
  const campaignId = startCampaignMutation.data.data.campaignId;
  navigate(`/admin/training-institutes/campaigns/${campaignId}`);
}
```

### 4. **Handle Errors Gracefully**

```typescript
// Show detailed error messages to user
if (startCampaignMutation.isError) {
  const error = startCampaignMutation.error;
  if ('errors' in error.response?.data) {
    // Validation errors
    showErrors(error.response.data.errors);
  } else {
    // Generic error
    showToast(error.message, 'error');
  }
}
```

---

## Data Mapping Example

### From Frontend to Backend

**Phase 1 - Excel Data:**
```
Candidate Name | Email           | Institute Name
John Doe       | john@example.com | ABC Institute
Jane Smith     | jane@example.com | XYZ Academy
```

**Phase 2 - Template Placeholders Detected:**
```html
<html>
  <body>
    <p>Congratulations {{candidate_name}},</p>
    <p>Your certificate for {{course_name}} is issued on {{issue_date}}.</p>
    <p>Please contact {{institute_name}} for more details.</p>
  </body>
</html>
```

**Phase 3 - Mappings:**
```
candidate_name  → Candidate Name    (100% confidence)
course_name     → (unmapped)
issue_date      → (unmapped)
institute_name  → Institute Name    (90% confidence)
```

**Request Payload:**
```json
{
  "recipients": [
    {
      "candidateName": "John Doe",
      "email": "john@example.com",
      "instituteName": "ABC Institute"
    },
    {
      "candidateName": "Jane Smith",
      "email": "jane@example.com",
      "instituteName": "XYZ Academy"
    }
  ],
  "mappings": [
    {
      "placeholderName": "candidate_name",
      "excelColumnName": "Candidate Name"
    },
    {
      "placeholderName": "course_name",
      "excelColumnName": null
    },
    {
      "placeholderName": "issue_date",
      "excelColumnName": null
    },
    {
      "placeholderName": "institute_name",
      "excelColumnName": "Institute Name"
    }
  ]
}
```

**Stored in Database (mappedData):**
```json
{
  "candidate_name": "John Doe",
  "course_name": null,
  "issue_date": null,
  "institute_name": "ABC Institute"
}
```

---

## Query Campaigns (Additional Endpoints)

### Get All Campaigns

```typescript
GET /api/v1/training-institutes/bulk-email/campaigns?limit=50&offset=0
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Campaigns retrieved successfully",
  "data": {
    "campaigns": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "campaignName": "Summer 2026 Batch",
        "status": "READY",
        "totalRecipients": 100,
        "validRecipients": 100,
        "invalidRecipients": 0,
        "createdAt": "2026-07-08T10:30:00.000Z"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

### Get Campaign Details

```typescript
GET /api/v1/training-institutes/bulk-email/campaigns/:campaignId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Campaign retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "campaignName": "Summer 2026 Batch",
    "status": "READY",
    "templateName": "Accreditation.html",
    "subject": "Congratulations",
    "totalRecipients": 100,
    "recipients": [
      {
        "id": "uuid...",
        "candidateName": "John Doe",
        "email": "john@example.com",
        "instituteName": "ABC Institute",
        "mappedData": {
          "candidate_name": "John Doe",
          "institute_name": "ABC Institute"
        },
        "status": "READY"
      }
    ]
  }
}
```

---

## Phase 6 Completion

Phase 6 backend implementation is complete and ready for frontend integration. All validation, error handling, and database operations are in place.

Next: Phase 7 will implement email sending, certificate generation, and queue processing.
