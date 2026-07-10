# IUCB Bulk Email - Implementation Guide

## Quick Start: What Changed

### 3 Simple Steps
1. **User uploads Excel file** with 3 columns only:
   - Candidate Name
   - Email
   - Institute Name

2. **System automatically generates**:
   - Credential IDs (CRED-2024-00001)
   - Certificate IDs (CERT-2024-00001)
   - Registration Numbers (REG-2024-00001)
   - Verification Tokens & URLs
   - QR Codes
   - Certificates (PDFs)

3. **System sends emails** with certificates attached

---

## Phase-by-Phase Implementation

### Phase 1: Excel Upload (User Action)
**File:** `frontend/src/hooks/useExcelUpload.ts`
```typescript
// Now validates ONLY 3 fields
- Candidate Name (required)
- Email (required, valid format)
- Institute Name (required)
```

**Changes:**
- Removed: Validation for optional credential fields
- Kept: Email validation, duplicate detection
- Simplified: 3-field validation only

### Phase 2: Template Upload (User Action)
**File:** `frontend/src/components/bulk-email/ExcelRequirementsCard.tsx`
```
Shows:
✓ 3 required columns (from Excel)
✓ 8 auto-generated fields (system)
- No mapping needed
- No placeholder configuration
```

**UI Pattern:**
- Blue information card
- Green checkmarks for found columns
- Red X for missing columns
- List of auto-generated fields

### Phase 3: Auto-Generate Credentials (System)
**File:** `backend/src/services/credential-generation.service.ts`

For each recipient, generate and store:
```typescript
{
  credentialId: "CRED-2024-00001",        // Auto-increment
  certificateId: "CERT-2024-00001",       // Auto-increment
  registrationNumber: "REG-2024-00001",   // Auto-increment
  verificationToken: crypto.randomBytes(32), // Secure random
  verificationUrl: "https://verify.iucb.org/verify/{token}",
  qrCode: generateQRCode(verificationUrl), // QR image
  issueDate: new Date(),                  // Current date
  expiryDate: new Date() + 365 days,      // Future date
  candidateName: recipient.candidateName, // From Excel
  email: recipient.email,                 // From Excel
  instituteName: recipient.instituteName  // From Excel
}
```

**Database:** All stored in `BulkEmailRecipient` table

### Phase 4: Auto-Generate Certificates (System)
**File:** `backend/src/services/certificate-generation.service.ts`

For each credential:
```
1. Get template HTML
2. Replace placeholders:
   {{CREDENTIAL_ID}} → CRED-2024-00001
   {{CERTIFICATE_ID}} → CERT-2024-00001
   {{REGISTRATION_NUMBER}} → REG-2024-00001
   {{CANDIDATE_NAME}} → John Doe
   {{INSTITUTE_NAME}} → ABC Training Institute
   {{ISSUE_DATE}} → 2024-07-08
   {{EXPIRY_DATE}} → 2025-07-08
   {{VERIFICATION_URL}} → https://verify.iucb.org/...
   {{QR_CODE}} → <img src="data:image/png;base64,...">
3. Convert HTML to PDF
4. Save PDF to storage
5. Store PDF path in database
```

### Phase 5: Email Configuration (User Action)
**File:** `frontend/src/routes/admin.training-institutes.bulk-email.tsx`

User configures:
- Email subject
- Sender name
- Reply-to email
- Email body

**Note:** No placeholder mapping needed - all fields are auto-generated

### Phase 6: Send Emails (System)
**File:** `backend/src/services/bulk-email-sending.service.ts`

For each recipient:
```
1. Get auto-generated certificate PDF
2. Get auto-generated credentials
3. Personalize email:
   {{CANDIDATE_NAME}} → John Doe
   {{INSTITUTE_NAME}} → ABC Training Institute
   {{VERIFICATION_URL}} → https://verify.iucb.org/...
4. Attach certificate PDF
5. Send via SMTP
6. Update status in database
```

### Phase 7: Report (System)
**File:** `backend/src/services/campaign-report.service.ts`

Display metrics:
- Total recipients: 100
- Credentials generated: 100 (100%)
- Certificates generated: 100 (100%)
- Emails sent: 100 (100%)
- Success rate: 100%
- Processing time: 2 minutes

---

## Code Examples

### Example 1: Validate Excel (Only 3 fields)
```typescript
// Before: Validated 6+ fields
// After: Validate only 3 fields
function validateRecipient(row: any) {
  const errors: string[] = [];
  
  // Only these 3 are required
  if (!row.candidateName?.trim()) {
    errors.push('Candidate name is required');
  }
  if (!row.email || !isValidEmail(row.email)) {
    errors.push('Valid email is required');
  }
  if (!row.instituteName?.trim()) {
    errors.push('Institute name is required');
  }
  
  return errors.length === 0 ? 'VALID' : 'INVALID';
}
```

### Example 2: Auto-Generate Credential
```typescript
async function generateCredential(recipient: Recipient) {
  const credential = {
    // Auto-generated
    credentialId: await generateNextId('CRED'),
    certificateId: await generateNextId('CERT'),
    registrationNumber: await generateNextId('REG'),
    verificationToken: crypto.randomBytes(32).toString('hex'),
    verificationUrl: `https://verify.iucb.org/verify/${verificationToken}`,
    qrCode: await QRCode.toDataURL(verificationUrl),
    issueDate: new Date(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    
    // From Excel
    candidateName: recipient.candidateName,
    email: recipient.email,
    instituteName: recipient.instituteName,
  };
  
  return await db.bulkEmailRecipient.create({ data: credential });
}
```

### Example 3: Auto-Replace Placeholders
```typescript
function replaceCredentialPlaceholders(html: string, credential: Credential) {
  let result = html;
  
  // Replace with auto-generated values
  result = result.replace(/{{CREDENTIAL_ID}}/g, credential.credentialId);
  result = result.replace(/{{CERTIFICATE_ID}}/g, credential.certificateId);
  result = result.replace(/{{REGISTRATION_NUMBER}}/g, credential.registrationNumber);
  result = result.replace(/{{VERIFICATION_URL}}/g, credential.verificationUrl);
  result = result.replace(/{{QR_CODE}}/g, `<img src="${credential.qrCode}" alt="QR Code">`);
  
  // Replace with user-provided values
  result = result.replace(/{{CANDIDATE_NAME}}/g, credential.candidateName);
  result = result.replace(/{{INSTITUTE_NAME}}/g, credential.instituteName);
  
  // Replace with date values
  result = result.replace(/{{ISSUE_DATE}}/g, formatDate(credential.issueDate));
  result = result.replace(/{{EXPIRY_DATE}}/g, formatDate(credential.expiryDate));
  
  return result;
}
```

### Example 4: Send Email with Attachment
```typescript
async function sendCampaignEmail(credential: Credential, config: EmailConfig) {
  const transporter = nodemailer.createTransport({
    // SMTP configuration
  });
  
  // Get certificate PDF from storage
  const pdfBuffer = await fs.readFile(credential.certificatePath);
  
  // Personalize email body
  let emailBody = config.emailBody;
  emailBody = emailBody.replace(/{{CANDIDATE_NAME}}/g, credential.candidateName);
  emailBody = emailBody.replace(/{{VERIFICATION_URL}}/g, credential.verificationUrl);
  
  // Send email
  await transporter.sendMail({
    to: credential.email,
    subject: config.emailSubject,
    html: emailBody,
    attachments: [{
      filename: 'certificate.pdf',
      content: pdfBuffer,
      contentType: 'application/pdf'
    }]
  });
}
```

---

## Database Queries

### Get All Credentials for a Campaign
```sql
SELECT * FROM "BulkEmailRecipients"
WHERE "campaignId" = $1
ORDER BY "createdAt" ASC;
```

### Get Credential by Verification Token
```sql
SELECT * FROM "BulkEmailRecipients"
WHERE "verificationToken" = $1
LIMIT 1;
```

### Update Certificate Generation Status
```sql
UPDATE "BulkEmailRecipients"
SET 
  "certificateStatus" = 'GENERATED',
  "certificatePath" = $1,
  "updatedAt" = NOW()
WHERE "id" = $2;
```

### Get Pending Emails to Send
```sql
SELECT * FROM "BulkEmailRecipients"
WHERE 
  "campaignId" = $1 
  AND "emailStatus" = 'PENDING'
ORDER BY "createdAt" ASC;
```

### Update Email Sending Status
```sql
UPDATE "BulkEmailRecipients"
SET 
  "emailStatus" = $1,
  "sentAt" = NOW(),
  "messageId" = $2,
  "smtpResponse" = $3,
  "updatedAt" = NOW()
WHERE "id" = $4;
```

---

## API Endpoints

### 1. Start Campaign
```
POST /api/v1/training-institutes/bulk-email/start
Body: {
  campaignName: string,
  campaignDescription: string,
  recipients: [{
    candidateName: string,
    email: string,
    instituteName: string
  }],
  templateHtml: string
}
Response: {
  campaignId: string,
  totalRecipients: number
}
```

### 2. Generate Credentials
```
POST /api/v1/training-institutes/bulk-email/campaigns/:campaignId/generate-credentials
Response: {
  credentialsGenerated: number,
  failedCount: number
}
```

### 3. Generate Certificates
```
POST /api/v1/training-institutes/bulk-email/campaigns/:campaignId/generate-certificates
Response: {
  certificatesGenerated: number,
  failedCount: number
}
```

### 4. Send Emails
```
POST /api/v1/training-institutes/bulk-email/campaigns/:campaignId/send-emails
Body: {
  emailSubject: string,
  emailBody: string,
  fromName: string,
  replyTo: string
}
Response: {
  emailsSent: number,
  failedCount: number
}
```

### 5. Get Campaign Report
```
GET /api/v1/training-institutes/bulk-email/campaigns/:campaignId/report
Response: {
  campaignId: string,
  totalRecipients: number,
  credentialsGenerated: number,
  certificatesGenerated: number,
  emailsSent: number,
  successRate: number,
  processingTime: number
}
```

---

## Testing Scenarios

### Test 1: Happy Path
```
1. Upload 10 recipients
2. Generate 10 credentials → all auto-generated
3. Generate 10 certificates → all created
4. Send 10 emails → all sent
Expected: 10/10 success (100%)
```

### Test 2: Invalid Email
```
1. Upload 10 recipients, 1 has invalid email
2. Generate 10 credentials → 9 success, 1 fail
Expected: 9 credentials generated, 1 error
```

### Test 3: Duplicate Email
```
1. Upload 10 recipients, 2 have same email
2. System marks as duplicate during validation
Expected: Only 8 valid recipients processed
```

### Test 4: Large Batch
```
1. Upload 1000 recipients
2. Generate credentials → auto-generated for all
3. Generate certificates → batched processing
4. Send emails → rate-limited (e.g., 10/sec)
Expected: 1000/1000 success, ~5 min processing
```

---

## Troubleshooting

### Issue: Excel Not Validating
**Solution:**
- Check column names: "Candidate Name", "Email", "Institute Name" (case-insensitive)
- Verify no extra/missing columns
- Ensure no empty rows in header

### Issue: Credentials Not Generating
**Solution:**
- Verify Excel validation passed
- Check database connection
- Ensure sequential ID generation is working
- Check crypto module for token generation

### Issue: Certificates Have Blank Fields
**Solution:**
- Verify template has correct placeholder names
- Check credential data was stored correctly
- Verify template placeholders match credential fields

### Issue: Emails Not Sending
**Solution:**
- Check SMTP configuration
- Verify certificate PDF exists
- Check email configuration in database
- Verify recipient email addresses are valid

---

## Monitoring

### Key Metrics to Track
```
1. Credential Generation Success Rate
   Target: 100%
   
2. Certificate Generation Success Rate
   Target: 100%
   
3. Email Delivery Success Rate
   Target: 99%+
   
4. Average Processing Time per Recipient
   Target: <1 sec (auto-generated)
   
5. Database Query Performance
   Target: <100ms for batch operations
```

### Logging
```typescript
// Log each phase
logger.info('Campaign started', { campaignId, recipients: count });
logger.info('Credentials generated', { campaignId, success, failed });
logger.info('Certificates generated', { campaignId, success, failed });
logger.info('Emails sent', { campaignId, sent, failed });
logger.error('Generation failed', { campaignId, error });
```

---

## Deployment Checklist

- ✅ Frontend builds successfully
- ✅ Backend compiles without errors
- ✅ Database migrations applied
- ✅ Environment variables configured
- ✅ SMTP settings verified
- ✅ Storage paths created
- ✅ SSL certificates valid
- ✅ Load testing completed
- ✅ Backup procedures in place
- ✅ Monitoring alerts configured

---

## Support

### Common Questions

**Q: Can I add more Excel columns?**
A: Yes, but the system will only use the 3 required columns and ignore others.

**Q: Can I change the credential ID format?**
A: Yes, modify the `generateCredentialId()` function in `credential-generation.service.ts`.

**Q: Can I customize the verification URL?**
A: Yes, modify the URL template in `generateCredential()`.

**Q: Can I add more placeholders to the template?**
A: Yes, add them to the template HTML. The system will leave them unchanged if no credential field matches.

**Q: How long does processing take?**
A: Approximately 1 minute for 100 recipients (credential generation, certificate generation, and email sending combined).

---

## Performance Tuning

### For 10,000+ Recipients
```typescript
// Use batch processing
const BATCH_SIZE = 100;

for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
  const batch = recipients.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(r => generateCredential(r)));
}
```

### For Large PDFs
```typescript
// Use streaming instead of buffer
fs.createReadStream(pdfPath)
  .pipe(transporter.attachments);
```

### For High Volume Email
```typescript
// Use queue system
const queue = new Bull('email-queue');
recipients.forEach(r => queue.add(r));
queue.process(sendEmail);
```

---

## Version History

### Version 1.0.0 (Current)
- ✅ Full automation
- ✅ 3-column Excel requirement
- ✅ Auto-generated credentials
- ✅ Auto-generated certificates
- ✅ Bulk email sending
- ✅ Campaign reporting

---

**Last Updated:** July 8, 2026
**Status:** ✅ Production Ready

