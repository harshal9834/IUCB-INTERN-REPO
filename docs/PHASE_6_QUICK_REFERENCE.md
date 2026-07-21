# Phase 6 - Quick Reference Card

## 📋 What's Implemented

Backend system to receive campaign data from frontend and create campaigns in database.

| Component | Status | File |
|-----------|--------|------|
| Database Models | ✅ | `backend/prisma/schema.prisma` |
| Migration | ✅ | `backend/prisma/migrations/20260708_add_bulk_email_models/` |
| Types | ✅ | `backend/src/types/bulk-email.types.ts` |
| Validator | ✅ | `backend/src/validators/bulk-email.validator.ts` |
| Service | ✅ | `backend/src/services/bulk-email.service.ts` |
| Controller | ✅ | `backend/src/controllers/bulk-email.controller.ts` |
| Routes | ✅ | `backend/src/routes/bulk-email.routes.ts` |

---

## 🔌 Main Endpoint

```
POST /api/v1/training-institutes/bulk-email/start
Authorization: Bearer <JWT_TOKEN>
```

**Input:** Campaign config + Excel data + Template HTML + Mappings
**Output:** Campaign ID + Status + Statistics
**Errors:** 400, 401, 404, 409, 500

---

## 📊 Database Tables

### BulkEmailCampaigns
```
id, campaignName, status (READY), templateName, totalRecipients, createdAt
```

### BulkEmailRecipients
```
id, campaignId, candidateName, email, instituteName, mappedData (JSON), status (READY)
```

---

## ✅ Validation

| Check | Required | What Gets Validated |
|-------|----------|-------------------|
| Campaign Name | Yes | Non-empty string |
| Email Subject | Yes | Non-empty string |
| Sender Name | Yes | Non-empty string |
| Reply-To Email | Yes | Valid email format |
| Priority | Yes | low/medium/high |
| Recipients | Yes | At least 1, all fields filled, valid emails |
| Template | Yes | HTML not empty |
| Mappings | Yes | At least 1 placeholder mapped |

---

## 🔐 Security

- ✅ JWT authentication required
- ✅ Admin verification
- ✅ Per-admin campaign isolation
- ✅ IP logging
- ✅ Audit trail

---

## 💾 Transaction Model

```
Begin Transaction
├─ Create BulkEmailCampaign (1 record)
├─ Create BulkEmailRecipient records (N records)
├─ Create AuditLog (1 record)
└─ Commit
   OR
   Rollback (on any error)
```

---

## 📈 Response Examples

### ✅ Success (200)
```json
{
  "success": true,
  "message": "Campaign created successfully with 100 recipients",
  "data": {
    "campaignId": "uuid...",
    "status": "READY",
    "recipientCount": 100
  }
}
```

### ❌ Validation Error (400)
```json
{
  "success": false,
  "message": "Campaign validation failed",
  "errors": [
    { "field": "campaign", "message": "Campaign name is required" }
  ]
}
```

### 🔒 Auth Error (401)
```json
{
  "success": false,
  "message": "Unauthorized: Admin authentication required"
}
```

---

## 🎯 Frontend Integration

### Step 1: Gather Data from All Phases
```typescript
const payload = {
  configuration: campaign.values,        // Phase 5
  recipients: excel.validRecipients,     // Phase 1
  templateName: template.metadata.name,  // Phase 2
  templateHtml: template.htmlContent,    // Phase 2
  mappings: mapping.exportMappings(),    // Phase 3
  detectedPlaceholders: template.placeholders.unique  // Phase 2
};
```

### Step 2: Call API
```typescript
const response = await fetch('/api/v1/training-institutes/bulk-email/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
```

### Step 3: Handle Response
```typescript
const data = await response.json();
if (response.ok) {
  // Success: data.data.campaignId
  navigate(`/campaigns/${data.data.campaignId}`);
} else {
  // Error: data.errors or data.message
  showError(data.message);
}
```

---

## 🧪 Quick Test

### Using cURL
```bash
curl -X POST http://localhost:3000/api/v1/training-institutes/bulk-email/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "configuration": {
      "campaignName": "Test Campaign",
      "emailSubject": "Test Subject",
      "senderName": "Test Sender",
      "replyToEmail": "test@example.com",
      "priority": "high",
      "smtpProfile": "default",
      "emailDelay": 1000,
      "batchSize": 100,
      "retryCount": 3,
      "generateCertificates": false,
      "attachPdfCertificate": false,
      "saveCertificates": false,
      "trackEmailStatus": false,
      "createAuditLog": true,
      "retryFailedEmails": false
    },
    "recipients": [
      {
        "candidateName": "John Doe",
        "email": "john@example.com",
        "instituteName": "Test Institute"
      }
    ],
    "templateName": "test.html",
    "templateHtml": "<html><body>Test {{name}}</body></html>",
    "mappings": [
      {
        "placeholderName": "name",
        "excelColumnName": "candidateName"
      }
    ],
    "detectedPlaceholders": ["name"]
  }'
```

---

## 📚 All Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/training-institutes/bulk-email/start` | Create campaign |
| GET | `/v1/training-institutes/bulk-email/campaigns` | List campaigns |
| GET | `/v1/training-institutes/bulk-email/campaigns/:id` | Get campaign details |
| GET | `/v1/training-institutes/bulk-email/campaigns/:id/statistics` | Get statistics |

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | No/invalid token | Add `Authorization: Bearer <token>` header |
| 400 Campaign name required | Empty name | Fill campaign name field |
| 400 At least one recipient | No recipients | Upload Excel with recipients |
| 400 Template HTML is required | No template | Upload HTML template file |
| 409 Campaign with this name | Duplicate name | Use different campaign name |
| 500 Internal error | Server issue | Check backend logs |

---

## 🚫 Not Implemented

- ❌ Email sending
- ❌ Certificate generation
- ❌ PDF creation
- ❌ Queue processing

**These are Phase 7+**

---

## ✨ Key Files

| Purpose | File | Lines |
|---------|------|-------|
| Database Model | `schema.prisma` | 50 |
| Type Definitions | `bulk-email.types.ts` | 218 |
| Validator | `bulk-email.validator.ts` | 250 |
| Service | `bulk-email.service.ts` | 248 |
| Controller | `bulk-email.controller.ts` | 210 |
| Routes | `bulk-email.routes.ts` | 50 |

**Total New Code: ~1,000 lines**

---

## 📖 Documentation

1. **Implementation Details:** `PHASE_6_IMPLEMENTATION_COMPLETE.md`
2. **Frontend Integration:** `frontend/src/integrations/PHASE_6_BACKEND_INTEGRATION.md`
3. **Quick Summary:** `PHASE_6_SUMMARY.md`

---

## ✅ Verification

- ✅ TypeScript: 0 errors
- ✅ Build: Passes
- ✅ Database: Migration applied
- ✅ Validation: Comprehensive
- ✅ Error Handling: Proper status codes
- ✅ Audit Logging: Implemented
- ✅ Transactions: Atomic
- ✅ Security: JWT required

---

## 🎯 Status

**PRODUCTION READY** ✅

Ready for:
- Testing
- Frontend integration
- Deployment

Next: Phase 7 (Email sending & processing)

---

## 📞 Support

**Need help?**
1. Check `PHASE_6_BACKEND_INTEGRATION.md` for integration examples
2. Review `PHASE_6_IMPLEMENTATION_COMPLETE.md` for details
3. See error responses above for troubleshooting
