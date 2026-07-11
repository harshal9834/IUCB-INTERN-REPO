-- Phase 8: Add Email Sending Support

-- Update BulkEmailCampaigns table
ALTER TABLE "BulkEmailCampaigns" ADD COLUMN "emailsSent" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BulkEmailCampaigns" ADD COLUMN "emailsFailed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "BulkEmailCampaigns" ADD COLUMN "emailDelay" INTEGER NOT NULL DEFAULT 2000;
ALTER TABLE "BulkEmailCampaigns" ADD COLUMN "startedAt" TIMESTAMP(3);
ALTER TABLE "BulkEmailCampaigns" ADD COLUMN "completedAt" TIMESTAMP(3);

-- Update BulkEmailRecipients table
ALTER TABLE "BulkEmailRecipients" ADD COLUMN "emailStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "BulkEmailRecipients" ADD COLUMN "messageId" TEXT;
ALTER TABLE "BulkEmailRecipients" ADD COLUMN "sentAt" TIMESTAMP(3);
ALTER TABLE "BulkEmailRecipients" ADD COLUMN "smtpResponse" TEXT;
ALTER TABLE "BulkEmailRecipients" ADD COLUMN "errorMessage" TEXT;

-- Create indexes for email-related queries
CREATE INDEX "BulkEmailRecipients_emailStatus_idx" ON "BulkEmailRecipients"("emailStatus");
CREATE INDEX "BulkEmailRecipients_sentAt_idx" ON "BulkEmailRecipients"("sentAt");
CREATE INDEX "BulkEmailCampaigns_startedAt_idx" ON "BulkEmailCampaigns"("startedAt");
CREATE INDEX "BulkEmailCampaigns_completedAt_idx" ON "BulkEmailCampaigns"("completedAt");
