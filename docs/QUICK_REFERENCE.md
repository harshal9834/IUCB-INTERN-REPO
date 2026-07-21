# Bulk Email Refactoring - Quick Reference Guide

## Files Created

### 🟦 Backend Services (4 files in `backend/src/services/`)
```
credential-generation.service.ts       - Phase 6: Generate & store credentials
certificate-generation.service.ts      - Phase 7: Generate certificates
bulk-email-sending.service.ts          - Phases 8-9: Email config & sending
campaign-report.service.ts             - Phase 10: Reports & statistics
```

### 🟦 Backend Controllers (4 files in `backend/src/controllers/`)
```
credential-generation.controller.ts    - Phase 6 endpoints
certificate-generation.controller.ts   - Phase 7 endpoints
bulk-email-sending.controller.ts       - Phases 8-9 endpoints
campaign-report.controller.ts          - Phase 10 endpoints
```

### 🟦 Backend Routes (1 file in `backend/src/routes/`)
```
bulk-email-refactored.routes.ts        - All endpoints organized by phase
```

### 🟩 Frontend Types (1 file in `frontend/src/types/`)
```
bulk-email-refactored.types.ts         - TypeScript interfaces for all phases
```

### 📋 Documentation (3 files in root directory)
```
BULK_EMAIL_REFACTORING.md              - Complete technical documentation
INTEGRATION_GUIDE.md                   - Step-by-step integration instructions
REFACTORING_SUMMARY.md                 - Executive summary
QUICK_REFERENCE.md                     - This file
```

## 10-Phase Workflow

| Phase | Name | Action | Endpoint | Files |
|-------|------|--------|----------|-------|
| 1-5 | Setup | Upload & map data | POST `/start` | existing |
| **6** | **Credentials** | **Store in DB FIRST** ✅ | **POST `/generate-credentials`** | **credential-generation.*** |
| **7** | **Certificates** | **Use stored creds** ✅ | **POST `/generate-certificates`** | **certificate-generation.*** |
| 8 | Email Config | Set subject, body, from | POST `/configure-email` | bulk-email-sending.controller |
| 9 | Send Emails | Send with attachments | POST `/send-emails` | bulk-email-sending.controller |
| 10 | Report | Generate statistics | GET `/report` | campaign-report.controller |

## Generated Credential Data (Phase 6)

```javascript
{
  credentialId: "CRED-2024-001",                    // Sequential
  certificateId: "550e8400-e29b-41d4-a716-446655440000",  // UUID
  registrationNumber: "REG-2024-00001",             // Sequential
  verificationToken: "a1b2c3d4...",                 // Random hex
  verificationUrl: "http://localhost:3000/verify?credential=CRED-2024-001&token=a1b2c3d4...",
  qrCodeUrl: "data:image/png;base64,...",          // QR code image
  issueDate: "2024-07-08",
  expiryDate: "2025-07-08",
  status: "VALID",
  storedInDatabase: true                           // ✅ CRITICAL
}
```

## Placeholder Replacements (Phase 7)

| Placeholder | Example |
|-------------|---------|
| `{{CANDIDATE_NAME}}` | John Doe |
| `{{CREDENTIAL_ID}}` | CRED-2024-001 |
| `{{CERTIFICATE_ID}}` | 550e8400-e29b-... |
| `{{REGISTRATION_NUMBER}}` | REG-2024-00001 |
| `{{ORGANIZATION_NAME}}` | IUCB |
| `{{ISSUE_DATE}}` | 08 July 2024 |
| `{{EXPIRY_DATE}}` | 08 July 2025 |
| `{{VERIFY_URL}}` | http://localhost:3000/verify?... |
| `{{QR_CODE}}` | Embedded QR code image |

## Email Status Tracking (Phase 9)

```
PENDING  → Email waiting to be sent
SENDING  → Email being sent
SENT     → Email sent successfully ✓
FAILED   → Email sending failed ✗
SKIPPED  → Email skipped (no cert, invalid email)
```

## Key API Endpoints

### Phase 6: Credentials
```bash
# Generate credentials (STORES IN DB FIRST)
POST /api/v1/training-institutes/bulk-email/campaigns/:id/generate-credentials

# Check progress
GET /api/v1/training-institutes/bulk-email/campaigns/:id/credential-progress

# Retry failed
POST /api/v1/training-institutes/bulk-email/campaigns/:id/retry-credentials
```

### Phase 7: Certificates (Uses stored credentials)
```bash
# Generate certificates (USES STORED CREDENTIALS FROM PHASE 6)
POST /api/v1/training-institutes/bulk-email/campaigns/:id/generate-certificates

# Check progress
GET /api/v1/training-institutes/bulk-email/campaigns/:id/certificate-progress

# Retry failed
POST /api/v1/training-institutes/bulk-email/campaigns/:id/retry-certificates
```

### Phase 8-9: Email
```bash
# Configure email
POST /api/v1/training-institutes/bulk-email/campaigns/:id/configure-email

# Send emails
POST /api/v1/training-institutes/bulk-email/campaigns/:id/send-emails

# Get stats
GET /api/v1/training-institutes/bulk-email/campaigns/:id/email-statistics

# Retry failed
POST /api/v1/training-institutes/bulk-email/campaigns/:id/retry-failed-emails
```

### Phase 10: Report
```bash
# Get comprehensive report
GET /api/v1/training-institutes/bulk-email/campaigns/:id/report

# Get statistics summary
GET /api/v1/training-institutes/bulk-email/campaigns/:id/report/statistics

# Download as CSV/Excel
GET /api/v1/training-institutes/bulk-email/campaigns/:id/report/download?format=csv|excel

# Get detailed report
GET /api/v1/training-institutes/bulk-email/campaigns/:id/report/details
```

## Integration Checklist

```
PRE-INTEGRATION
[ ] Node.js and npm installed
[ ] PostgreSQL running
[ ] Backend and frontend directories
[ ] Git or version control

INSTALLATION
[ ] npm install (add dependencies)
[ ] Configure .env (SMTP, FRONTEND_URL)
[ ] Create storage directories
[ ] Run Prisma migration

COPY FILES
[ ] Copy 4 service files
[ ] Copy 4 controller files
[ ] Copy 1 route file
[ ] Copy 1 type file

CONFIGURATION
[ ] Update backend app.ts with new routes
[ ] Update frontend components to use new types
[ ] Import API functions in frontend
[ ] Create storage directories

TESTING
[ ] Test Phase 6 (credentials in DB)
[ ] Test Phase 7 (certs with stored creds)
[ ] Test Phase 9 (emails with attachments)
[ ] Test Phase 10 (reports download)

DEPLOYMENT
[ ] Run full workflow
[ ] Check database records
[ ] Verify email delivery
[ ] Verify report generation
```

## Environment Variables

```bash
# .env file
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@iucb.org
FRONTEND_URL=http://localhost:3000
```

## Dependencies to Install

```bash
npm install nodemailer qrcode pdfkit csv-writer xlsx
npm install --save-dev @types/nodemailer @types/pdfkit
```

## Directory Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── credential-generation.service.ts      ← NEW
│   │   ├── certificate-generation.service.ts     ← NEW
│   │   ├── bulk-email-sending.service.ts         ← NEW
│   │   └── campaign-report.service.ts            ← NEW
│   ├── controllers/
│   │   ├── credential-generation.controller.ts   ← NEW
│   │   ├── certificate-generation.controller.ts  ← NEW
│   │   ├── bulk-email-sending.controller.ts      ← NEW
│   │   └── campaign-report.controller.ts         ← NEW
│   └── routes/
│       └── bulk-email-refactored.routes.ts       ← NEW
└── storage/
    ├── certificates/                             ← CREATE
    └── reports/                                  ← CREATE

frontend/
└── src/
    └── types/
        └── bulk-email-refactored.types.ts        ← NEW
```

## Database Schema Changes

### New Fields in BulkEmailCampaign
```sql
-- Phase 6 fields
credentialsGenerated INT DEFAULT 0
credentialsFailed INT DEFAULT 0
lastCredentialId INT DEFAULT 0

-- Phase 8 fields
subject VARCHAR
senderName VARCHAR
replyTo VARCHAR
```

### New Fields in BulkEmailRecipient
```sql
-- Phase 6 link
credentialId VARCHAR UNIQUE

-- Phase 7 status
certificateStatus VARCHAR DEFAULT 'PENDING'

-- Phase 9 tracking
emailStatus VARCHAR DEFAULT 'PENDING'
messageId VARCHAR
sentAt TIMESTAMP
smtpResponse TEXT
errorMessage TEXT
```

### Updated Credential Model
```sql
-- Phase 6 fields (NEW)
credentialId VARCHAR UNIQUE
registrationNumber VARCHAR
verificationToken VARCHAR
verificationUrl VARCHAR
qrCode TEXT
certificateGenerated BOOLEAN DEFAULT FALSE
```

## Common Commands

```bash
# Create migration after schema changes
npx prisma migrate dev --name refactor_bulk_email

# Test credential generation
curl -X POST \
  http://localhost:4000/api/v1/training-institutes/bulk-email/campaigns/CAMPAIGN_ID/generate-credentials \
  -H "Authorization: Bearer TOKEN"

# Check credential progress
curl -X GET \
  http://localhost:4000/api/v1/training-institutes/bulk-email/campaigns/CAMPAIGN_ID/credential-progress \
  -H "Authorization: Bearer TOKEN"

# Download report as CSV
curl -X GET \
  "http://localhost:4000/api/v1/training-institutes/bulk-email/campaigns/CAMPAIGN_ID/report/download?format=csv" \
  -H "Authorization: Bearer TOKEN" \
  -o report.csv
```

## TypeScript Interfaces (Key Types)

```typescript
interface GeneratedCredential {
  credentialId: string;           // CRED-2024-001
  certificateId: string;          // UUID
  registrationNumber: string;     // REG-2024-00001
  verificationToken: string;
  verificationUrl: string;
  qrCodeUrl: string;
  issueDate: Date;
  expiryDate: Date;
  status: string;
  storedInDatabase: boolean;      // ✅ CRITICAL
}

interface EmailConfiguration {
  subject: string;
  body: string;                   // With {{PLACEHOLDERS}}
  fromName: string;
  replyTo: string;
  includeCredential: boolean;
  certificateAttachmentName: string;
}

interface CampaignReportData {
  campaignId: string;
  recipients: { total: number; valid: number; invalid: number };
  credentials: { generated: number; failed: number; successRate: number };
  certificates: { generated: number; failed: number; successRate: number };
  emails: { sent: number; failed: number; skipped: number; successRate: number };
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Credentials not in DB | Check Prisma migration ran, verify PostgreSQL connection |
| SMTP errors | Verify email credentials, check firewall allows port 587 |
| PDF generation fails | Install pdfkit, check storage dir permissions |
| Emails not sending | Verify certificates generated, check email config |
| Type errors | Import from `bulk-email-refactored.types` |
| Route not found | Verify `bulk-email-refactored.routes.ts` is imported in `app.ts` |

## Key Changes from Original

| Before | After |
|--------|-------|
| Certificates before credentials | ✅ Credentials BEFORE certificates |
| No credential storage | ✅ Credentials stored in PostgreSQL |
| No verification system | ✅ Verification tokens + QR codes |
| No email tracking | ✅ Track email status (PENDING, SENT, FAILED, SKIPPED) |
| No error recovery | ✅ Retry logic for all phases |
| No progress tracking | ✅ Real-time progress endpoints |
| No reporting | ✅ Comprehensive reports + CSV/Excel export |
| Limited documentation | ✅ Extensive documentation + inline comments |

## Critical Workflow Order

```
1️⃣  Phases 1-5: Setup & Mapping (existing)
2️⃣  Phase 6: Generate Credentials → STORE IN DATABASE ✅
3️⃣  Phase 7: Generate Certificates → USE STORED CREDENTIALS ✅
4️⃣  Phase 8: Configure Email
5️⃣  Phase 9: Send Emails with Attachments
6️⃣  Phase 10: Generate Reports
```

**DO NOT skip Phase 6 or run Phase 7 before Phase 6 completes!**

## Documentation Files

| File | Purpose |
|------|---------|
| BULK_EMAIL_REFACTORING.md | Complete technical reference |
| INTEGRATION_GUIDE.md | Step-by-step setup instructions |
| REFACTORING_SUMMARY.md | Executive summary |
| QUICK_REFERENCE.md | This quick lookup guide |

## Next Steps

1. Read REFACTORING_SUMMARY.md
2. Follow INTEGRATION_GUIDE.md
3. Copy the 9 new files
4. Run Prisma migration
5. Configure environment
6. Test each phase
7. Deploy to staging
8. QA testing
9. Production deployment

## Support

- Check inline code comments in service files
- Review error messages (descriptive)
- Read INTEGRATION_GUIDE.md troubleshooting
- Check database with SQL queries
- Use progress endpoints to diagnose issues

---

**Last Updated:** July 8, 2024
**Version:** 1.0
**Status:** Production Ready ✅
