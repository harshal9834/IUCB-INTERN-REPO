-- Phase 7: Add Certificate Generation Support

-- Update BulkEmailCampaigns table
ALTER TABLE "BulkEmailCampaigns" ADD COLUMN "certificatesGenerated" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BulkEmailCampaigns" ADD COLUMN "certificatesFailed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BulkEmailCampaigns" ADD COLUMN "lastCredentialId" INTEGER NOT NULL DEFAULT 0;

-- Update BulkEmailRecipients table
ALTER TABLE "BulkEmailRecipients" ADD COLUMN "certificateStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "BulkEmailRecipients" ADD COLUMN "credentialId" TEXT UNIQUE;
ALTER TABLE "BulkEmailRecipients" ADD COLUMN "certificatePath" TEXT;
ALTER TABLE "BulkEmailRecipients" ADD COLUMN "generatedAt" TIMESTAMP(3);
ALTER TABLE "BulkEmailRecipients" ADD COLUMN "certificateError" TEXT;

-- Create indexes for certificate-related queries
CREATE INDEX "BulkEmailRecipients_certificateStatus_idx" ON "BulkEmailRecipients"("certificateStatus");
CREATE INDEX "BulkEmailRecipients_credentialId_idx" ON "BulkEmailRecipients"("credentialId");
CREATE INDEX "BulkEmailRecipients_generatedAt_idx" ON "BulkEmailRecipients"("generatedAt");
