# Integration Guide: Bulk Email Refactoring

This guide explains how to integrate the refactored bulk email workflow into your existing IUCB project.

## Files Overview

### Backend Services (4 new services)

1. **`credential-generation.service.ts`**
   - Generates and stores credentials in PostgreSQL
   - Phase 6 implementation
   - No dependencies on certificate service

2. **`certificate-generation.service.ts`**
   - Generates PDFs using stored credentials
   - Phase 7 implementation
   - Depends on credentials being stored first

3. **`bulk-email-sending.service.ts`**
   - Configures and sends emails with attachments
   - Phases 8-9 implementation
   - Uses generated certificates

4. **`campaign-report.service.ts`**
   - Generates comprehensive reports
   - Phase 10 implementation
   - Exports CSV and Excel formats

### Backend Controllers (4 new controllers)

1. **`credential-generation.controller.ts`** (Phase 6)
2. **`certificate-generation.controller.ts`** (Phase 7)
3. **`bulk-email-sending.controller.ts`** (Phases 8-9)
4. **`campaign-report.controller.ts`** (Phase 10)

### Backend Routes

**`bulk-email-refactored.routes.ts`**
- Replaces or extends existing bulk-email routes
- Clearly organized by phase
- Includes all 10 phases

### Frontend Types

**`bulk-email-refactored.types.ts`**
- Updated TypeScript interfaces for all phases
- Matches backend response structures
- Enables type-safe frontend development

## Integration Steps

### Step 1: Install Dependencies

Add required npm packages to `backend/package.json`:

```json
{
  "dependencies": {
    "nodemailer": "^6.9.7",
    "qrcode": "^1.5.3",
    "pdfkit": "^0.13.0",
    "csv-writer": "^1.6.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/nodemailer": "^6.4.14",
    "@types/pdfkit": "^0.12.11"
  }
}
```

Run:
```bash
npm install
```

### Step 2: Configure Environment Variables

Add to `backend/.env`:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@iucb.org

# Frontend URL (for verification links)
FRONTEND_URL=http://localhost:3000
```

### Step 3: Update Prisma Schema

Add or update these models in `prisma/schema.prisma`:

```prisma
// Updated BulkEmailCampaign
model BulkEmailCampaign {
  id                    String                      @id @default(uuid()) @db.Uuid
  campaignName          String
  description           String?
  uploadedById          String                      @db.Uuid
  status                BulkEmailCampaignStatus     @default(DRAFT)
  templateName          String
  templateHtml          String
  subject               String?                     // Added for Phase 8
  senderName            String?                     // Added for Phase 8
  replyTo               String?                     // Added for Phase 8
  totalRecipients       Int                         @default(0)
  validRecipients       Int                         @default(0)
  invalidRecipients     Int                         @default(0)
  credentialsGenerated  Int                         @default(0) // Added for Phase 6
  credentialsFailed     Int                         @default(0) // Added for Phase 6
  certificatesGenerated Int                         @default(0)
  certificatesFailed    Int                         @default(0)
  emailsSent            Int                         @default(0)
  emailsFailed          Int                         @default(0)
  lastCredentialId      Int                         @default(0) // Added for Phase 6
  emailDelay            Int?                        @default(0)
  startedAt             DateTime?
  completedAt           DateTime?
  createdAt             DateTime                    @default(now())
  updatedAt             DateTime                    @updatedAt
  deletedAt             DateTime?

  uploadedBy Admin               @relation(fields: [uploadedById], references: [id], onDelete: Cascade)
  recipients BulkEmailRecipient[]

  @@index([uploadedById])
  @@index([status])
  @@index([createdAt])
}

// Updated BulkEmailRecipient
model BulkEmailRecipient {
  id                String  @id @default(uuid()) @db.Uuid
  campaignId        String  @db.Uuid
  candidateName     String
  email             String
  instituteName     String
  mappedData        Json?   // Mapped placeholder data
  status            BulkEmailRecipientStatus @default(PENDING)
  validationErrors  String?

  credentialId      String? // Added for Phase 6 - Link to credential
  certificateStatus String? @default("PENDING") // Added: PENDING, GENERATING, GENERATED, FAILED
  certificatePath   String?
  generatedAt       DateTime?
  certificateError  String?

  emailStatus       String? @default("PENDING") // Added: PENDING, SENDING, SENT, FAILED, SKIPPED
  messageId         String?
  sentAt            DateTime?
  smtpResponse      String?
  errorMessage      String?

  createdAt         DateTime @default(now())
  campaign          BulkEmailCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@index([campaignId])
  @@index([email])
  @@index([status])
  @@index([certificateStatus])
  @@index([credentialId])
  @@index([emailStatus])
  @@index([sentAt])
  @@index([createdAt])
}

// Update existing Credential model
model Credential {
  id                  String    @id @default(uuid()) @db.Uuid
  credentialId        String    @unique              // CRED-2024-001
  certificateId       String?                        // UUID for certificate reference
  registrationNumber  String?                        // REG-2024-00001
  standard            String?
  issueDate           DateTime
  expiryDate          DateTime
  status              CredentialStatus @default(VALID)
  organizationId      String?   @db.Uuid
  auditorId           String?   @db.Uuid
  applicationId       String?   @db.Uuid
  
  qrCode              String?   // QR code data URL
  verificationUrl     String?   // Verification URL
  verificationToken   String?   // Random token for verification
  certificateGenerated Boolean @default(false)
  certificatePath     String?
  generatedAt         DateTime?
  generatedById       String?   @db.Uuid

  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  organization        Organization?  @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  auditor             Auditor?       @relation(fields: [auditorId], references: [id], onDelete: SetNull)
  application         Application?   @relation(fields: [applicationId], references: [id], onDelete: SetNull)
  generatedBy         Admin?         @relation(fields: [generatedById], references: [id], onDelete: SetNull)

  @@index([credentialId])
  @@index([status])
  @@index([issueDate])
  @@index([organizationId])
  @@index([auditorId])
  @@index([applicationId])
  @@map("Credentials")
}
```

### Step 4: Create Database Migration

```bash
cd backend
npx prisma migrate dev --name refactor_bulk_email_phases_6_7_8_9_10
```

### Step 5: Copy Service Files

Copy these files to `backend/src/services/`:
- `credential-generation.service.ts`
- `certificate-generation.service.ts`
- `bulk-email-sending.service.ts`
- `campaign-report.service.ts`

### Step 6: Copy Controller Files

Copy these files to `backend/src/controllers/`:
- `credential-generation.controller.ts`
- `certificate-generation.controller.ts`
- `bulk-email-sending.controller.ts`
- `campaign-report.controller.ts`

### Step 7: Update Routes

Option A: Replace routes entirely
```typescript
// backend/src/app.ts
import bulkEmailRoutes from './routes/bulk-email-refactored.routes.js';
app.use('/api/v1/training-institutes/bulk-email', bulkEmailRoutes);
```

Option B: Merge with existing routes
```typescript
// Merge endpoints from bulk-email-refactored.routes.ts into your existing routes file
```

### Step 8: Copy Frontend Types

Copy `bulk-email-refactored.types.ts` to `frontend/src/types/`

### Step 9: Update Frontend Components

In your frontend bulk email component, import the new types:

```typescript
import type {
  CredentialGenerationState,
  CertificateGenerationState,
  EmailConfiguration,
  EmailSendingState,
  CampaignReport,
  WorkflowStep,
} from '../types/bulk-email-refactored.types';
```

### Step 10: Create Storage Directories

```bash
# Create certificate storage directory
mkdir -p storage/certificates
chmod 755 storage/certificates

# Create reports storage directory
mkdir -p storage/reports
chmod 755 storage/reports
```

## Frontend Implementation

### Component Structure

Your main bulk email component should follow this structure:

```typescript
function BulkEmailCampaignComponent() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('SETUP');
  const [campaignState, setCampaignState] = useState<BulkEmailCampaignState>({
    campaignId: '',
    currentStep: 'SETUP',
    isProcessing: false,
    error: null,
    completedSteps: [],
  });

  // Phases 1-5: Setup (existing implementation)
  // ...

  // Phase 6: Credential Generation
  const handleGenerateCredentials = async () => {
    try {
      setCampaignState(prev => ({ ...prev, isProcessing: true }));
      const response = await credentialsApi.generateCredentials(campaignState.campaignId);
      setCampaignState(prev => ({
        ...prev,
        credentialGeneration: response.data,
        isProcessing: false,
      }));
      setCurrentStep('CERTIFICATES');
    } catch (error) {
      setCampaignState(prev => ({
        ...prev,
        error: error.message,
        isProcessing: false,
      }));
    }
  };

  // Phase 7: Certificate Generation
  const handleGenerateCertificates = async () => {
    try {
      setCampaignState(prev => ({ ...prev, isProcessing: true }));
      const response = await certificatesApi.generateCertificates(campaignState.campaignId);
      setCampaignState(prev => ({
        ...prev,
        certificateGeneration: response.data,
        isProcessing: false,
      }));
      setCurrentStep('EMAIL_CONFIG');
    } catch (error) {
      setCampaignState(prev => ({
        ...prev,
        error: error.message,
        isProcessing: false,
      }));
    }
  };

  // Phase 8: Email Configuration
  const handleConfigureEmail = async (config: EmailConfiguration) => {
    setCampaignState(prev => ({
      ...prev,
      emailConfiguration: config,
    }));
    setCurrentStep('EMAIL_SENDING');
  };

  // Phase 9: Send Emails
  const handleSendEmails = async () => {
    try {
      setCampaignState(prev => ({ ...prev, isProcessing: true }));
      const response = await emailApi.sendCampaignEmails(
        campaignState.campaignId,
        campaignState.emailConfiguration!
      );
      setCampaignState(prev => ({
        ...prev,
        emailSending: response.data,
        isProcessing: false,
      }));
      setCurrentStep('REPORT');
    } catch (error) {
      setCampaignState(prev => ({
        ...prev,
        error: error.message,
        isProcessing: false,
      }));
    }
  };

  // Phase 10: Campaign Report
  const handleGenerateReport = async () => {
    try {
      const response = await reportApi.getCampaignReport(campaignState.campaignId);
      setCampaignState(prev => ({
        ...prev,
        report: response.data,
      }));
    } catch (error) {
      setCampaignState(prev => ({
        ...prev,
        error: error.message,
      }));
    }
  };

  return (
    <div className="bulk-email-container">
      {/* Render appropriate phase component */}
      {currentStep === 'CREDENTIALS' && (
        <CredentialGenerationComponent
          campaignId={campaignState.campaignId}
          onComplete={handleGenerateCredentials}
          state={campaignState.credentialGeneration}
        />
      )}
      {/* ... other phases ... */}
    </div>
  );
}
```

### API Service File

Create `frontend/src/services/api/bulk-email.api.ts`:

```typescript
import axios from 'axios';
import type {
  CredentialGenerationResponse,
  CertificateGenerationResponse,
  EmailSendingResponse,
  CampaignReportData,
} from '../types/bulk-email-refactored.types';

const API_BASE = '/api/v1/training-institutes/bulk-email';

export const bulkEmailApi = {
  // Phase 6
  generateCredentials: (campaignId: string) =>
    axios.post<CredentialGenerationResponse>(
      `${API_BASE}/campaigns/${campaignId}/generate-credentials`
    ),

  getCredentialProgress: (campaignId: string) =>
    axios.get(`${API_BASE}/campaigns/${campaignId}/credential-progress`),

  retryCredentials: (campaignId: string) =>
    axios.post(`${API_BASE}/campaigns/${campaignId}/retry-credentials`),

  // Phase 7
  generateCertificates: (campaignId: string) =>
    axios.post<CertificateGenerationResponse>(
      `${API_BASE}/campaigns/${campaignId}/generate-certificates`
    ),

  getCertificateProgress: (campaignId: string) =>
    axios.get(`${API_BASE}/campaigns/${campaignId}/certificate-progress`),

  retryCertificates: (campaignId: string) =>
    axios.post(`${API_BASE}/campaigns/${campaignId}/retry-certificates`),

  // Phase 8
  configureEmail: (campaignId: string, config: EmailConfiguration) =>
    axios.post(`${API_BASE}/campaigns/${campaignId}/configure-email`, config),

  // Phase 9
  sendEmails: (campaignId: string, config: EmailConfiguration) =>
    axios.post<EmailSendingResponse>(
      `${API_BASE}/campaigns/${campaignId}/send-emails`,
      config
    ),

  getEmailStatistics: (campaignId: string) =>
    axios.get(`${API_BASE}/campaigns/${campaignId}/email-statistics`),

  retryEmails: (campaignId: string, config: EmailConfiguration) =>
    axios.post(
      `${API_BASE}/campaigns/${campaignId}/retry-failed-emails`,
      config
    ),

  // Phase 10
  getReport: (campaignId: string) =>
    axios.get<{ data: CampaignReportData }>(
      `${API_BASE}/campaigns/${campaignId}/report`
    ),

  downloadReport: (campaignId: string, format: 'csv' | 'excel' = 'csv') =>
    axios.get(`${API_BASE}/campaigns/${campaignId}/report/download`, {
      params: { format },
      responseType: 'blob',
    }),
};
```

## Testing the Integration

### Test Phase 6: Credential Generation

```bash
curl -X POST \
  http://localhost:4000/api/v1/training-institutes/bulk-email/campaigns/CAMPAIGN_ID/generate-credentials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Phase 7: Certificate Generation

```bash
curl -X POST \
  http://localhost:4000/api/v1/training-institutes/bulk-email/campaigns/CAMPAIGN_ID/generate-certificates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Phase 9: Send Emails

```bash
curl -X POST \
  http://localhost:4000/api/v1/training-institutes/bulk-email/campaigns/CAMPAIGN_ID/send-emails \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Your Certificate",
    "body": "Dear {{CANDIDATE_NAME}}, your certificate is ready",
    "fromName": "IUCB",
    "replyTo": "support@iucb.org",
    "includeCredential": true,
    "certificateAttachmentName": "certificate.pdf"
  }'
```

## Verification Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Prisma migration completed
- [ ] Service files copied to `backend/src/services/`
- [ ] Controller files copied to `backend/src/controllers/`
- [ ] Routes updated in `app.ts`
- [ ] Storage directories created (`storage/certificates`, `storage/reports`)
- [ ] Frontend types imported
- [ ] Frontend API services created
- [ ] Tests run successfully
- [ ] Phase 6 credentials generating correctly
- [ ] Phase 7 certificates using stored credentials
- [ ] Phase 9 emails sending with attachments
- [ ] Phase 10 reports generating correctly

## Support & Debugging

### Common Integration Issues

**1. Credentials not storing in database**
- Check Prisma migration completed: `npx prisma migrate status`
- Verify `Credential` table exists: `psql -c "\dt credentials"`
- Check PostgreSQL connection in `.env`

**2. SMTP errors during email sending**
- Verify email credentials in `.env`
- Test SMTP connection: `telnet smtp.gmail.com 587`
- For Gmail: Use App Password, not regular password
- Check firewall/network allows SMTP port

**3. PDF generation failures**
- Ensure `pdfkit` is installed: `npm list pdfkit`
- Check storage directory has write permissions: `ls -la storage/certificates`
- Verify template HTML is valid

**4. Type errors in frontend**
- Clear TypeScript cache: `rm -rf node_modules/.cache`
- Regenerate types: `npm run generate:types`
- Import from correct path: `bulk-email-refactored.types`

## Next Steps

1. Test all phases in development
2. Set up monitoring/logging for each phase
3. Configure background job queue for production
4. Set up error alerting
5. Create user documentation
6. Deploy to staging for QA testing

## Questions?

Refer to the inline comments and documentation in the service files for detailed explanations of each phase.
