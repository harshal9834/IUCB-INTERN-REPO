# IUCB Bulk Email Workflow Refactoring

## Overview

This document outlines the complete refactoring of the Bulk Email Campaign workflow to follow a proper enterprise accreditation process. The key change is ensuring credentials are generated and stored in PostgreSQL BEFORE certificate generation.

## Workflow Structure

### 10-Step Enterprise Accreditation Process

```
1. Upload Excel                           → Frontend data processing
2. Upload HTML Certificate Template       → Frontend template parsing
3. Auto Detect Placeholders              → Frontend placeholder extraction
4. Auto Mapping                          → Frontend auto-matching
5. Manual Mapping (unmatched only)       → Frontend manual review
6. ✅ Generate Credentials               → Backend: Store in PostgreSQL
7. ✅ Generate Certificates             → Backend: Use stored credentials
8. Configure Email                       → Frontend/Backend email config
9. Send Bulk Emails                      → Backend: Send with attachments
10. Campaign Report                      → Backend: Generate reports
```

## Critical Workflow Changes

### BEFORE (Broken Flow)
```
Setup → Template → Mapping → Preview → Config → Generate Certificates → Store Credentials → Send Emails
                                              ❌ Certificates before credentials!
```

### AFTER (Fixed Flow)
```
Setup → Template → Mapping → Preview → Config → Store Credentials → Generate Certificates → Send Emails
                                              ✅ Credentials stored FIRST!
```

## Implementation Details

### Phase 6: Generate Credentials (BEFORE Certificates)

**File:** `backend/src/services/credential-generation.service.ts`

For every Excel row:
- Generate unique Credential ID (sequential: CRED-2024-001)
- Generate Certificate ID (UUID)
- Generate Registration Number (sequential: REG-2024-00001)
- Generate Verification Token (random 32-byte hex)
- Build Verification URL: `{FRONTEND_URL}/verify?credential={credentialId}&token={token}`
- Generate QR Code (points to verification URL)
- Set Issue Date (current date)
- Set Expiry Date (1 year from issue)
- **Store EVERY credential in PostgreSQL** before moving to Phase 7

```typescript
// Database Structure
Credential {
  id: UUID
  credentialId: TEXT (unique) // CRED-2024-001
  certificateId: TEXT         // UUID
  registrationNumber: TEXT    // REG-2024-00001
  verificationToken: TEXT     // hex token
  verificationUrl: TEXT       // /verify?credential=...
  qrCode: TEXT               // QR code data URL
  issueDate: Date            // Generated now
  expiryDate: Date           // 1 year from issue
  status: TEXT               // VALID
  certificateGenerated: BOOLEAN // false (updated in Phase 7)
  certificatePath: TEXT      // Updated after cert generation
  createdAt: Date
}
```

**API Endpoint:**
```
POST /api/v1/training-institutes/bulk-email/campaigns/:campaignId/generate-credentials
Response: {
  totalRecipients: 100,
  successCount: 100,
  failedCount: 0,
  storedInDatabase: true,
  credentials: [{
    credentialId: "CRED-2024-001",
    certificateId: "uuid-xxx",
    registrationNumber: "REG-2024-00001",
    verificationToken: "hex-token",
    verificationUrl: "http://localhost:3000/verify?credential=...",
    qrCodeUrl: "data:image/png;base64,...",
    issueDate: "2024-07-08",
    expiryDate: "2025-07-08",
    status: "VALID",
    storedInDatabase: true
  }]
}
```

### Phase 7: Generate Certificates (AFTER Credentials)

**File:** `backend/src/services/certificate-generation.service.ts`

Uses credential data stored in PostgreSQL:
- Retrieve each recipient's stored credential
- Replace all mapped placeholders with actual values
- Generate PDF certificate
- Embed QR code in certificate
- Store certificate path in database
- Update credential `certificateGenerated = true`

**Placeholder Replacements:**
```
{{CANDIDATE_NAME}}      → John Doe
{{CREDENTIAL_ID}}       → CRED-2024-001
{{CERTIFICATE_ID}}      → uuid-xxx
{{REGISTRATION_NUMBER}} → REG-2024-00001
{{ORGANIZATION_NAME}}   → IUCB
{{ISSUE_DATE}}         → 08 July 2024
{{EXPIRY_DATE}}        → 08 July 2025
{{VERIFY_URL}}         → http://localhost:3000/verify?credential=...
{{QR_CODE}}            → Embedded QR code image
```

**API Endpoint:**
```
POST /api/v1/training-institutes/bulk-email/campaigns/:campaignId/generate-certificates
Response: {
  campaignId: "uuid-xxx",
  totalCertificates: 100,
  generatedCount: 100,
  failureCount: 0,
  usedStoredCredentials: true,
  completedAt: "2024-07-08T10:30:00Z",
  results: [{
    recipientId: "recipient-id",
    candidateName: "John Doe",
    credentialId: "CRED-2024-001",
    success: true,
    certificatePath: "/storage/certificates/CRED-2024-001.pdf"
  }]
}
```

### Phase 8: Configure Email

**File:** `backend/src/controllers/bulk-email-sending.controller.ts`

Allows configuration of:
- Email Subject
- Email Body (with placeholder support)
- From Name
- Reply-To
- Certificate attachment settings

**API Endpoint:**
```
POST /api/v1/training-institutes/bulk-email/campaigns/:campaignId/configure-email
Request Body: {
  subject: "Your ISO Accreditation Certificate",
  body: "Dear {{CANDIDATE_NAME}}, your certificate for {{ORGANIZATION_NAME}} is ready...",
  fromName: "IUCB Certification",
  replyTo: "support@iucb.org",
  includeCredential: true,
  certificateAttachmentName: "certificate.pdf"
}
```

### Phase 9: Send Bulk Emails

**File:** `backend/src/services/bulk-email-sending.service.ts`

Workflow:
- Validate recipient email address
- Attach generated certificate PDF
- Replace placeholders in email body
- Send via SMTP
- Update database status after each email

**Email Status Tracking:**
- `PENDING` - Waiting to be sent
- `SENDING` - Currently being sent
- `SENT` - Successfully sent
- `FAILED` - Sending failed
- `SKIPPED` - Skipped (no certificate, invalid email)

**API Endpoint:**
```
POST /api/v1/training-institutes/bulk-email/campaigns/:campaignId/send-emails
Response: {
  campaignId: "uuid-xxx",
  totalEmails: 100,
  sentCount: 98,
  failedCount: 2,
  skippedCount: 0,
  results: [{
    recipientId: "recipient-id",
    candidateName: "John Doe",
    email: "john@example.com",
    status: "SENT",
    messageId: "msg-id-xxx",
    sentAt: "2024-07-08T10:35:00Z"
  }]
}
```

### Phase 10: Campaign Report

**File:** `backend/src/services/campaign-report.service.ts`

Displays comprehensive metrics:
- Total Recipients
- Credentials Generated (count & success rate)
- Certificates Generated (count & success rate)
- Emails Sent (count & success rate)
- Failed Emails
- Campaign timeline
- Download report (CSV or Excel)

**API Endpoints:**
```
GET /api/v1/training-institutes/bulk-email/campaigns/:campaignId/report
GET /api/v1/training-institutes/bulk-email/campaigns/:campaignId/report/statistics
GET /api/v1/training-institutes/bulk-email/campaigns/:campaignId/report/download?format=csv|excel
GET /api/v1/training-institutes/bulk-email/campaigns/:campaignId/report/details
```

**Response Example:**
```json
{
  "campaignId": "uuid-xxx",
  "campaignName": "Q3 2024 Accreditation",
  "status": "COMPLETED",
  "recipients": {
    "total": 100,
    "valid": 100,
    "invalid": 0
  },
  "credentials": {
    "generated": 100,
    "failed": 0,
    "successRate": 100
  },
  "certificates": {
    "generated": 100,
    "failed": 0,
    "successRate": 100
  },
  "emails": {
    "sent": 98,
    "failed": 2,
    "skipped": 0,
    "successRate": 98
  },
  "timeline": {
    "uploadDate": "2024-07-08T09:00:00Z",
    "credentialGenerationDate": "2024-07-08T09:15:00Z",
    "certificateGenerationDate": "2024-07-08T09:30:00Z",
    "emailSendingCompletedDate": "2024-07-08T10:00:00Z"
  }
}
```

## Database Schema Updates

### New/Modified Tables

**BulkEmailCampaign**
```prisma
model BulkEmailCampaign {
  id                    String    @id @default(uuid())
  campaignName          String
  status                String    // DRAFT, READY, PROCESSING, COMPLETED, FAILED
  credentialsGenerated  Int       @default(0)
  credentialsFailed     Int       @default(0)
  certificatesGenerated Int       @default(0)
  certificatesFailed    Int       @default(0)
  emailsSent            Int       @default(0)
  emailsFailed          Int       @default(0)
  lastCredentialId      Int       @default(0)
  recipients            BulkEmailRecipient[]
}
```

**BulkEmailRecipient**
```prisma
model BulkEmailRecipient {
  id                  String    @id @default(uuid())
  campaignId          String
  candidateName       String
  email               String
  credentialId        String?   @unique  // CRED-2024-001
  certificatePath     String?
  certificateStatus   String    @default("PENDING") // PENDING, GENERATED, FAILED
  emailStatus         String    @default("PENDING") // PENDING, SENDING, SENT, FAILED, SKIPPED
  sentAt              DateTime?
  messageId           String?
  errorMessage        String?
  campaign            BulkEmailCampaign @relation(fields: [campaignId], references: [id])
}
```

**Credential** (updated)
```prisma
model Credential {
  id                  String    @id @default(uuid())
  credentialId        String    @unique  // CRED-2024-001
  certificateId       String?
  registrationNumber  String?
  verificationToken   String?
  verificationUrl     String?
  qrCode              String?
  issueDate           DateTime
  expiryDate          DateTime
  status              String    @default("VALID")
  certificateGenerated Boolean  @default(false)
  certificatePath     String?
}
```

## File Structure

### Backend Files Created
```
backend/src/
├── services/
│   ├── credential-generation.service.ts     (Phase 6)
│   ├── certificate-generation.service.ts    (Phase 7)
│   ├── bulk-email-sending.service.ts        (Phases 8-9)
│   └── campaign-report.service.ts           (Phase 10)
├── controllers/
│   ├── credential-generation.controller.ts  (Phase 6)
│   ├── certificate-generation.controller.ts (Phase 7)
│   ├── bulk-email-sending.controller.ts     (Phases 8-9)
│   └── campaign-report.controller.ts        (Phase 10)
└── routes/
    └── bulk-email-refactored.routes.ts      (Updated routes)
```

### Frontend Files Created
```
frontend/src/
└── types/
    └── bulk-email-refactored.types.ts       (Updated types)
```

## Integration Points

### API Flow

1. **Phases 1-5 Setup**
   ```
   POST /api/v1/training-institutes/bulk-email/start
   ```

2. **Phase 6: Generate Credentials**
   ```
   POST /api/v1/training-institutes/bulk-email/campaigns/:id/generate-credentials
   ```

3. **Phase 7: Generate Certificates**
   ```
   POST /api/v1/training-institutes/bulk-email/campaigns/:id/generate-certificates
   ```

4. **Phase 8: Configure Email**
   ```
   POST /api/v1/training-institutes/bulk-email/campaigns/:id/configure-email
   ```

5. **Phase 9: Send Emails**
   ```
   POST /api/v1/training-institutes/bulk-email/campaigns/:id/send-emails
   ```

6. **Phase 10: Get Report**
   ```
   GET /api/v1/training-institutes/bulk-email/campaigns/:id/report
   ```

## Error Handling

### Retry Logic

- **Credential Generation Failures**
  - Endpoint: `POST /campaigns/:id/retry-credentials`
  - Retries generating credentials for failed recipients

- **Certificate Generation Failures**
  - Endpoint: `POST /campaigns/:id/retry-certificates`
  - Uses already-stored credentials, only re-generates PDFs

- **Email Sending Failures**
  - Endpoint: `POST /campaigns/:id/retry-failed-emails`
  - Retries sending to failed recipients

### Progress Tracking

- **Credential Progress**: `GET /campaigns/:id/credential-progress`
- **Certificate Progress**: `GET /campaigns/:id/certificate-progress`
- **Email Progress**: `GET /campaigns/:id/email-statistics`

## Production Considerations

### Performance
- Process credentials in batches if > 1000 recipients
- Implement async certificate generation with background workers
- Use queue system (Bull, RabbitMQ) for email sending

### Data Security
- Encrypt verification tokens in database
- Use secure QR code generation
- Store certificates with proper access control
- Log all credential and email operations

### Monitoring
- Track credential generation time
- Monitor certificate generation performance
- Log email delivery failures
- Create alerts for campaign failures

### Scalability
- Use database indexes on campaignId, credentialId, email
- Implement pagination for large result sets
- Cache campaign statistics
- Archive old campaigns

## Migration from Old Workflow

If migrating from the old workflow:

1. Do NOT run Phase 7 (Generate Certificates) until Phase 6 completes
2. Validate all credentials are stored before generating certificates
3. Use retry endpoints to recover from any failures
4. Delete and regenerate certificates if needed

## Testing

### Unit Tests Required
- Credential generation (ID uniqueness, URL validation)
- Certificate generation (PDF creation, placeholder replacement)
- Email sending (SMTP integration, attachment handling)
- Report generation (statistics calculation)

### Integration Tests Required
- Full workflow (Phases 1-10)
- Retry logic (credentials, certificates, emails)
- Error scenarios (invalid emails, missing credentials)
- Report downloads (CSV, Excel)

## Known Limitations & Future Improvements

1. **Current Limitations**
   - QR codes embedded as images, not interactive
   - HTML template rendering limited to text extraction
   - Email sending is synchronous (no queue system)
   - No background job processing

2. **Future Improvements**
   - Implement background job queue (Bull, Celery)
   - Add advanced HTML-to-PDF conversion (Puppeteer, Wkhtmltopdf)
   - Implement webhook for email delivery confirmation
   - Add campaign scheduling (send at specific time)
   - Multi-language support for email templates
   - Batch credential generation with progress WebSocket updates

## Support & Troubleshooting

### Common Issues

**Credentials not generating:**
- Check Excel file format and recipient data
- Ensure campaign status is READY
- Check PostgreSQL connection

**Certificates failing after credentials generated:**
- Verify credentials are in database (`Credential` table)
- Check template HTML is valid
- Ensure storage directory has write permissions

**Emails not sending:**
- Verify SMTP credentials in .env
- Check recipient email addresses are valid
- Ensure certificates were generated successfully
- Check email configuration (subject, body, fromName)

## Questions or Issues?

Refer to the inline code comments in:
- `credential-generation.service.ts`
- `certificate-generation.service.ts`
- `bulk-email-sending.service.ts`
- `campaign-report.service.ts`
