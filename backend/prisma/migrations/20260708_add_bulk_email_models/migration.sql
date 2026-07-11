-- Add Bulk Email Campaign System - Phase 6

-- Create BulkEmailCampaign table
CREATE TABLE "BulkEmailCampaigns" (
    "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "campaignName" TEXT NOT NULL,
    "description" TEXT,
    "uploadedById" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "templateName" TEXT NOT NULL,
    "templateHtml" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "replyTo" TEXT NOT NULL,
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "validRecipients" INTEGER NOT NULL DEFAULT 0,
    "invalidRecipients" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BulkEmailCampaigns_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "Admin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create BulkEmailRecipient table
CREATE TABLE "BulkEmailRecipients" (
    "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "campaignId" UUID NOT NULL,
    "candidateName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "instituteName" TEXT NOT NULL,
    "mappedData" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "validationErrors" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BulkEmailRecipients_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "BulkEmailCampaigns" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX "BulkEmailCampaigns_uploadedById_idx" ON "BulkEmailCampaigns"("uploadedById");
CREATE INDEX "BulkEmailCampaigns_status_idx" ON "BulkEmailCampaigns"("status");
CREATE INDEX "BulkEmailCampaigns_createdAt_idx" ON "BulkEmailCampaigns"("createdAt");

CREATE INDEX "BulkEmailRecipients_campaignId_idx" ON "BulkEmailRecipients"("campaignId");
CREATE INDEX "BulkEmailRecipients_email_idx" ON "BulkEmailRecipients"("email");
CREATE INDEX "BulkEmailRecipients_status_idx" ON "BulkEmailRecipients"("status");
CREATE INDEX "BulkEmailRecipients_createdAt_idx" ON "BulkEmailRecipients"("createdAt");
