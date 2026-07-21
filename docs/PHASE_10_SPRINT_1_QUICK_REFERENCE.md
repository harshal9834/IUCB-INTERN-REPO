# Phase 10 Sprint 1 - Quick Reference Guide

## New Components Overview

### Frontend Components

#### 1. CampaignHistory Component
**Location**: `frontend/src/components/bulk-email/CampaignHistory.tsx`

**Purpose**: Display all campaigns with search, filtering, sorting, and pagination

**Props**:
```typescript
interface CampaignHistoryProps {
  onCampaignSelect?: (campaign: Campaign) => void;
}
```

**Usage**:
```tsx
import CampaignHistory from '@/components/bulk-email/CampaignHistory';

export function MyPage() {
  const handleCampaignSelect = (campaign) => {
    // Navigate to campaign details or open modal
    console.log('Selected:', campaign.id);
  };

  return (
    <CampaignHistory onCampaignSelect={handleCampaignSelect} />
  );
}
```

**Features**:
- Real-time search by campaign name or ID
- Advanced filter panel (status, date range, success rate, archived toggle)
- Sortable columns (click headers)
- Pagination (10, 20, 50, 100 items per page)
- Color-coded status badges
- Quick action buttons (View, Export, Archive)
- Loading states and error handling

**State Management**:
- Manages its own pagination and filtering
- Fetches data on filter/sort/page change
- Handles loading and error states

---

#### 2. CampaignDetails Component
**Location**: `frontend/src/components/bulk-email/CampaignDetails.tsx`

**Purpose**: Display comprehensive campaign information in a modal

**Props**:
```typescript
interface CampaignDetailsModalProps {
  campaignId: string;
  campaignName: string;
  onClose: () => void;
}
```

**Usage**:
```tsx
import CampaignDetails from '@/components/bulk-email/CampaignDetails';

export function MyPage() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  return (
    <>
      <CampaignHistory onCampaignSelect={setSelectedCampaign} />
      
      {selectedCampaign && (
        <CampaignDetails
          campaignId={selectedCampaign.id}
          campaignName={selectedCampaign.campaignName}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </>
  );
}
```

**Features**:
- Modal overlay with dark background
- Expandable sections (Overview, Statistics, Timeline, Errors)
- KPI cards with key metrics
- Recipient/Email/Certificate status breakdowns
- Visual timeline of events
- Error summary with affected counts
- Action buttons (Export Report, Archive)
- Loading states and error handling

**Sections**:
1. **Overview**: Campaign metadata (status, creator, dates, description)
2. **Statistics**: KPIs, status breakdowns, success rates
3. **Timeline**: Chronological events with visual timeline
4. **Errors**: Top errors affecting recipients

---

### Backend API Endpoints

#### Advanced Campaign Query
**Endpoint**: `GET /api/v1/training-institutes/bulk-email/campaigns/advanced`

**Query Parameters**:
```
?limit=20&offset=0&status=COMPLETED&dateFrom=2024-01-01&dateTo=2024-12-31
&search=campaign&sortBy=successRate&sortOrder=desc&includeArchived=false
```

**Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 50 | Items per page (max 200) |
| offset | number | 0 | Pagination offset |
| status | string | - | Filter by status (DRAFT, READY, PROCESSING, COMPLETED, FAILED) |
| dateFrom | date | - | From date (ISO format) |
| dateTo | date | - | To date (ISO format) |
| search | string | - | Search by campaign name or ID |
| sortBy | string | createdAt | Sort field (createdAt, campaignName, status, successRate) |
| sortOrder | string | desc | Sort direction (asc, desc) |
| includeArchived | boolean | false | Include archived campaigns |

**Response**:
```json
{
  "success": true,
  "message": "Campaigns retrieved successfully",
  "data": {
    "campaigns": [
      {
        "id": "uuid",
        "campaignName": "Q1 Training Campaign",
        "status": "COMPLETED",
        "totalRecipients": 1000,
        "validRecipients": 950,
        "invalidRecipients": 50,
        "certificatesGenerated": 950,
        "certificatesFailed": 0,
        "emailsSent": 950,
        "emailsFailed": 5,
        "successRate": 94.74,
        "certificateSuccessRate": 100.0,
        "processingTimeMinutes": 120,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T12:30:00Z",
        "completedAt": "2024-01-15T12:30:00Z",
        "startedAt": "2024-01-15T10:30:00Z",
        "uploadedBy": {
          "id": "uuid",
          "fullName": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "total": 1000,
    "limit": 20,
    "offset": 0
  }
}
```

---

#### Campaign Details with Timeline
**Endpoint**: `GET /api/v1/training-institutes/bulk-email/campaigns/:campaignId/details`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "campaignName": "Q1 Training",
    "status": "COMPLETED",
    "metrics": {
      "totalRecipients": 1000,
      "validRecipients": 950,
      "invalidRecipients": 50,
      "successRate": 94.74,
      "certificateSuccessRate": 100.0,
      "processingTimeMinutes": 120
    },
    "recipientStatistics": {
      "PENDING": 0,
      "VALID": 950,
      "INVALID": 50,
      "COMPLETED": 950
    },
    "emailStatistics": {
      "PENDING": 0,
      "SENT": 950,
      "FAILED": 5
    },
    "certificateStatistics": {
      "PENDING": 0,
      "GENERATED": 950,
      "FAILED": 0
    },
    "errorSummary": [
      {
        "message": "Invalid email format",
        "count": 3
      }
    ],
    "timeline": [
      {
        "event": "Created",
        "timestamp": "2024-01-15T10:30:00Z",
        "status": "COMPLETED"
      },
      {
        "event": "Started",
        "timestamp": "2024-01-15T10:31:00Z",
        "status": "COMPLETED"
      },
      {
        "event": "Completed",
        "timestamp": "2024-01-15T12:30:00Z",
        "status": "COMPLETED"
      }
    ]
  }
}
```

---

#### Recipient Details
**Endpoint**: `GET /api/v1/training-institutes/bulk-email/recipients/:recipientId`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "campaignId": "uuid",
    "candidateName": "Jane Smith",
    "email": "jane@institute.edu",
    "instituteName": "Tech Institute",
    "mappedData": {
      "candidate_name": "Jane Smith",
      "email": "jane@institute.edu",
      "issue_date": "2024-01-15"
    },
    "status": "COMPLETED",
    "validationErrors": null,
    "certificateStatus": "GENERATED",
    "credentialId": "CRED-001",
    "certificatePath": "storage/certificates/campaign-uuid/jane-smith.pdf",
    "generatedAt": "2024-01-15T11:00:00Z",
    "certificateError": null,
    "emailStatus": "SENT",
    "messageId": "<message-id@smtp.com>",
    "sentAt": "2024-01-15T11:05:00Z",
    "smtpResponse": "250 Message accepted",
    "errorMessage": null,
    "campaign": {
      "id": "uuid",
      "campaignName": "Q1 Training Campaign"
    }
  }
}
```

---

#### Archive Campaign
**Endpoint**: `POST /api/v1/training-institutes/bulk-email/campaigns/:campaignId/archive`

**Request Body**:
```json
{
  "reason": "COMPLETED"  // Optional: COMPLETED, USER_REQUEST, RETENTION_EXPIRED
}
```

**Response**:
```json
{
  "success": true,
  "message": "Campaign archived successfully",
  "data": {
    "id": "uuid",
    "deletedAt": "2024-01-20T15:30:00Z"
  }
}
```

---

#### Restore Campaign
**Endpoint**: `POST /api/v1/training-institutes/bulk-email/campaigns/:campaignId/restore`

**Response**:
```json
{
  "success": true,
  "message": "Campaign restored successfully",
  "data": {
    "id": "uuid",
    "deletedAt": null
  }
}
```

---

### API Service Functions

**File**: `frontend/src/services/api/campaigns.api.ts`

```typescript
// Get campaigns with advanced filtering
const response = await campaignsApi.getCampaignsAdvanced({
  limit: 20,
  offset: 0,
  status: 'COMPLETED',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  searchQuery: 'Q1',
  includeArchived: false,
  sortBy: 'successRate',
  sortOrder: 'desc'
});

// Get campaign details with timeline
const response = await campaignsApi.getCampaignDetailsExtended(campaignId);

// Get recipient details
const response = await campaignsApi.getRecipientDetails(recipientId);

// Archive campaign
const response = await campaignsApi.archiveCampaign(campaignId, 'USER_REQUEST');

// Restore campaign
const response = await campaignsApi.restoreCampaign(campaignId);
```

---

## Integration Examples

### Example 1: Campaign Management Page

```tsx
import React, { useState } from 'react';
import CampaignHistory from '@/components/bulk-email/CampaignHistory';
import CampaignDetails from '@/components/bulk-email/CampaignDetails';

export function CampaignManagementPage() {
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-4">Campaign Management</h1>
        <CampaignHistory onCampaignSelect={setSelectedCampaign} />
      </div>

      {selectedCampaign && (
        <CampaignDetails
          campaignId={selectedCampaign.id}
          campaignName={selectedCampaign.campaignName}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
}
```

---

### Example 2: With Routing Integration

```tsx
import { useNavigate, useParams } from 'react-router-dom';

export function CampaignManagementPage() {
  const navigate = useNavigate();
  const { campaignId } = useParams();

  const handleCampaignSelect = (campaign) => {
    navigate(`/campaigns/${campaign.id}`);
  };

  return (
    <div>
      <CampaignHistory onCampaignSelect={handleCampaignSelect} />
      
      {campaignId && (
        <CampaignDetails
          campaignId={campaignId}
          campaignName="Campaign"
          onClose={() => navigate('/campaigns')}
        />
      )}
    </div>
  );
}
```

---

## Styling & Theming

### Color Scheme
- **Status Badges**:
  - DRAFT: Gray
  - READY: Blue
  - PROCESSING: Yellow
  - COMPLETED: Green
  - FAILED: Red
  - PAUSED: Orange

- **Success Rate**:
  - ≥ 90%: Green
  - ≥ 75%: Yellow
  - ≥ 50%: Orange
  - < 50%: Red

### Typography
- Headers: Tailwind classes (`text-2xl font-bold`)
- Body text: `text-sm text-gray-600`
- Labels: `text-sm font-medium text-gray-700`

### Spacing
- Components: `space-y-6` (vertical rhythm)
- Padding: `p-4` to `p-6`
- Gaps: `gap-2` to `gap-6`

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Not authenticated | Login required |
| 404 Not Found | Campaign doesn't exist | Check campaign ID |
| 500 Server Error | Backend error | Retry or contact support |
| Network Error | Connection issue | Check internet, retry |

### User Feedback
- Error banner at top of page
- Red background with error message
- Refresh button to retry
- Console logs for debugging

---

## Performance Optimization Tips

### Frontend
1. **Pagination**: Use 20-50 items per page for large datasets
2. **Search**: Add debouncing (500ms) for search input
3. **Lazy Loading**: Load campaign details only when modal opens
4. **Memoization**: Consider useMemo for calculations

### Backend
1. **Indexes**: Verify indexes on sortBy fields
2. **Query Optimization**: Use `select` to fetch only needed fields
3. **Caching**: Consider Redis for frequently accessed campaigns
4. **Pagination**: Don't fetch entire dataset

---

## Testing Checklist

### Functional Testing
- [ ] Campaign list loads with correct data
- [ ] Search filters campaigns in real-time
- [ ] All filter combinations work together
- [ ] Sorting changes campaign order correctly
- [ ] Pagination navigates between pages
- [ ] Campaign details modal opens/closes
- [ ] All statistics calculate correctly
- [ ] Archive/Restore buttons work
- [ ] Error messages display on failure

### UX Testing
- [ ] Loading spinner appears during fetch
- [ ] Empty state shows when no campaigns
- [ ] Error banner displays clearly
- [ ] Buttons are clickable and responsive
- [ ] Modal can be closed with X button
- [ ] Mobile layout is responsive

### Performance Testing
- [ ] Campaign list loads in < 2 seconds
- [ ] Modal opens smoothly
- [ ] Search responds to typing
- [ ] Pagination works smoothly
- [ ] No console errors or warnings

---

## Troubleshooting

### Issue: Campaign list doesn't load
**Solution**: Check network tab in browser DevTools, verify API is running

### Issue: Search not working
**Solution**: Check if API returns correct filtered results

### Issue: Modal doesn't open
**Solution**: Verify `onCampaignSelect` prop is passed correctly

### Issue: Styling looks wrong
**Solution**: Ensure Tailwind CSS is imported in parent component

---

## Future Enhancements (Phase 11+)

- Search debouncing (reduce API calls)
- Advanced filters with saved presets
- Bulk actions (archive multiple, delete multiple)
- Export filtered results to CSV/Excel
- Real-time campaign status updates
- Campaign comparison (side-by-side)
- Recipient search and filtering
- Certificate download from details modal
- Export reports from details modal
- Send test email to recipient

---

## Support & Documentation

- **Component Props**: See JSDoc comments in component files
- **API Docs**: See route handlers in controller files
- **Error Codes**: See error messages returned by API
- **TypeScript Types**: See `bulk-email.types.ts`

---

**Document Version**: 1.0  
**Last Updated**: July 8, 2026  
**Status**: ✅ Current for Sprint 1

