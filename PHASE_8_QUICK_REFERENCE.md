# PHASE 8 – QUICK REFERENCE GUIDE
## SMTP Bulk Email Delivery Engine

---

## KEY FILES

| File | Purpose | Lines |
|------|---------|-------|
| `backend/src/services/email.service.ts` | Core email sending logic | 530 |
| `backend/src/controllers/email.controller.ts` | HTTP endpoints | 150 |
| `backend/src/routes/email.routes.ts` | Route registration | 45 |
| `backend/src/types/email.types.ts` | TypeScript types | 105 |
| `backend/prisma/schema.prisma` | Database schema (updated) | Updated |
| `backend/prisma/migrations/20260708_add_email_sending` | Database migration | Applied |

---

## API ENDPOINTS

### 1. Send Emails
```
POST /api/v1/training-institutes/bulk-email/campaigns/{campaignId}/send-emails
Headers: Authorization: Bearer {token}
Returns: Campaign completion report with success/failure counts
```

### 2. Get Statistics
```
GET /api/v1/training-institutes/bulk-email/campaigns/{campaignId}/email-statistics
Headers: Authorization: Bearer {token}
Returns: Real-time email sending progress
```

### 3. Retry Failed
```
POST /api/v1/training-institutes/bulk-email/campaigns/{campaignId}/retry-failed-emails
Headers: Authorization: Bearer {token}
Returns: Campaign completion report (retried emails only)
```

---

## ENVIRONMENT VARIABLES

```env
# SMTP Configuration (required)
SMTP_HOST=smtp.gmail.com          # SMTP server
SMTP_PORT=587                      # SMTP port
SMTP_SECURE=false                  # Use TLS? (false for port 587, true for 465)
SMTP_USER=your-email@gmail.com     # Gmail address or SMTP username
SMTP_PASS=your-app-password        # App-specific password (NOT Gmail password)
MAIL_FROM=IUCB <your-email@gmail.com>  # From email header
```

---

## DATABASE FIELDS ADDED

### BulkEmailCampaign
- `emailsSent: Int` - Total emails sent
- `emailsFailed: Int` - Total emails failed
- `emailDelay: Int` - Milliseconds between emails (default 2000)
- `startedAt: DateTime?` - Campaign start timestamp
- `completedAt: DateTime?` - Campaign completion timestamp

### BulkEmailRecipient
- `emailStatus: String` - PENDING, SENDING, SENT, FAILED
- `messageId: String?` - SMTP message ID
- `sentAt: DateTime?` - Send timestamp
- `smtpResponse: String?` - Full SMTP response (JSON)
- `errorMessage: String?` - Error details if failed

### BulkEmailCampaignStatus (New Enum Value)
- `PARTIALLY_COMPLETED` - Added to support partial success

---

## EMAIL FLOW

```
Campaign READY
    ↓
For each recipient with generated certificate:
    ↓
1. Generate personalized HTML
   • Replace placeholders: {{candidate_name}}, {{credential_id}}, etc.
    ↓
2. Verify PDF certificate file exists
    ↓
3. Attach PDF to email
   • Filename: {candidateName}-{credentialId}.pdf
   • MIME type: application/pdf
    ↓
4. Send via SMTP
   • Capture message ID
   • Capture response
    ↓
5. Update database
   • On success: emailStatus = SENT, save messageId, sentAt
   • On failure: emailStatus = FAILED, save errorMessage
    ↓
6. Apply delay (default 2000ms)
    ↓
7. Continue with next recipient (never stop on failure)
    ↓
Campaign completion report
```

---

## KEY METHODS

### EmailService Class

```typescript
// Main entry point
async sendCampaignEmails(campaignId: string, progressCallback?: Function)

// Get progress
async getEmailStatistics(campaignId: string)

// Internal methods (private)
async sendSingleEmail(context: RecipientEmailContext, campaign: any)
async generateEmailBody(context: RecipientEmailContext, campaign: any): string
async composeEmail(body: string, campaign: any, context: RecipientEmailContext): any
async initializeSmtp(): Promise<void>
async closeSmtp(): Promise<void>
private delayExecution(milliseconds: number): Promise<void>
```

---

## RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "message": "Email sending completed",
  "data": {
    "campaignId": "uuid",
    "totalProcessed": 100,
    "successCount": 98,
    "failureCount": 2,
    "completedAt": "2026-07-08T15:30:00Z",
    "results": [
      {
        "recipientId": "uuid",
        "candidateName": "John Doe",
        "email": "john@example.com",
        "success": true,
        "messageId": "<message-id@smtp>",
        "sentAt": "2026-07-08T15:25:00Z"
      }
    ]
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Failed to send emails",
  "error": "Campaign not found: uuid"
}
```

### Statistics Response
```json
{
  "success": true,
  "message": "Email statistics retrieved",
  "data": {
    "campaignId": "uuid",
    "campaignName": "Q3 Accreditation",
    "campaignStatus": "PROCESSING",
    "totalRecipients": 100,
    "emailsSent": 45,
    "emailsFailed": 2,
    "statusBreakdown": {
      "pending": 53,
      "sending": 0,
      "sent": 45,
      "failed": 2
    },
    "percentage": 47,
    "startedAt": "2026-07-08T15:20:00Z",
    "completedAt": null
  }
}
```

---

## TESTING

```bash
# 1. Verify build succeeds
cd backend
npm run build

# 2. Start application
# (start your dev server)

# 3. Send emails (with valid campaignId)
curl -X POST \
  "http://localhost:3000/api/v1/training-institutes/bulk-email/campaigns/CAMPAIGN_ID/send-emails" \
  -H "Authorization: Bearer TOKEN"

# 4. Check progress
curl -X GET \
  "http://localhost:3000/api/v1/training-institutes/bulk-email/campaigns/CAMPAIGN_ID/email-statistics" \
  -H "Authorization: Bearer TOKEN"

# 5. Check logs
# Watch for:
# 🚀 Starting email sending for campaign
# 📧 Sending X/Y
# ✅ Email sent successfully
# ❌ Failed to send email
# ✅ Email sending completed
```

---

## COMMON ISSUES & SOLUTIONS

| Issue | Solution |
|-------|----------|
| SMTP connection failed | Check .env SMTP settings are correct |
| Emails not sending | Verify campaign status = READY, certificates generated |
| Partial delivery | This is normal! Check failed recipients in database |
| Rate too slow | Reduce emailDelay in campaign config (Phase 5) |
| Some emails fail | Campaign continues, failed emails logged, can retry |

---

## DATABASE QUERIES

```sql
-- Check email statistics
SELECT campaignId, emailsSent, emailsFailed, status 
FROM "BulkEmailCampaigns" WHERE id = 'CAMPAIGN_ID';

-- Get all failed emails
SELECT candidateName, email, errorMessage 
FROM "BulkEmailRecipients" 
WHERE campaignId = 'CAMPAIGN_ID' AND emailStatus = 'FAILED';

-- Get email audit logs
SELECT description, metadata, status, createdAt 
FROM "AuditLog" 
WHERE entityId = 'CAMPAIGN_ID' AND module = 'EMAIL_SENDING' 
ORDER BY createdAt DESC;
```

---

## SECURITY CHECKLIST

- ✅ SMTP credentials NOT hardcoded
- ✅ Read from environment variables only
- ✅ Credentials not logged
- ✅ Authentication required on all endpoints
- ✅ Audit logging enabled
- ✅ Input validation implemented
- ✅ Error messages don't expose secrets

---

## EMAIL TEMPLATE

The system uses a professional HTML template:

```html
Subject: From campaign configuration
Body:
Dear {{candidate_name}},

Congratulations on your accreditation with IUCB!

We are pleased to inform you that your accreditation has been 
successfully processed and approved.

Your personalized certificate has been generated and is attached 
to this email.

Credential ID: {{credential_id}}
Organization: {{institute_name}}

Please keep your credential ID in a safe place for future reference 
and verification purposes.

If you have any questions regarding your accreditation, 
please feel free to contact us.

Best regards,
International Union for Certification & Benchmarking (IUCB)
Email: support@iucb.org
```

---

## RATE LIMITING

- **Default:** 2000ms (2 seconds) between emails
- **Configurable:** Set `emailDelay` in campaign config (Phase 5)
- **Formula:** 100 recipients × 2000ms = 200 seconds (~3 minutes)
- **Min:** 500ms (may cause SMTP throttling)
- **Max:** 10000ms (safe for all SMTP providers)

---

## CAMPAIGN STATUS FLOW

```
DRAFT (Phase 5 - Created)
  ↓
READY (Phase 6 - Recipients configured)
  ↓
PROCESSING (Phase 7 - Certificates generating)
  ↓
COMPLETED/PARTIALLY_COMPLETED/FAILED (Phase 8 - Emails sending)
```

---

## DEPLOYMENT CHECKLIST

- [ ] SMTP credentials configured in `.env`
- [ ] Prisma migration applied to database
- [ ] Prisma client regenerated
- [ ] TypeScript compilation: 0 errors
- [ ] Build verification: ✅ SUCCESS
- [ ] Phase 7 (certificate generation) working
- [ ] Test with small campaign (5-10 recipients)
- [ ] Monitor logs during first production run
- [ ] Check audit logs for completeness

---

## WHAT'S NEXT

**Phase 8 ✅ COMPLETE**

**Phase 9 - Dashboard & Reporting:**
- Live sending progress dashboard
- Email delivery reports
- Failed email retry interface
- Email history viewer
- Delivery analytics

---

## QUICK LINKS

- Full Documentation: `PHASE_8_EMAIL_DELIVERY_COMPLETE.md`
- Schema: `backend/prisma/schema.prisma`
- Types: `backend/src/types/email.types.ts`
- Service: `backend/src/services/email.service.ts`
- Controller: `backend/src/controllers/email.controller.ts`
- Routes: `backend/src/routes/email.routes.ts`

---

**Status: ✅ PRODUCTION READY**  
**Build: ✅ SUCCESS**  
**TypeScript: 0 ERRORS (Phase 8)**
