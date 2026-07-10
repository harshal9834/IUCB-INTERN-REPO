-- Phase 5-10: Advanced Search, Compliance, Security, Integrity, Retention
-- Add new fields to existing tables and create new tables for advanced features

-- Update SavedSearch table for advanced search features
ALTER TABLE "SavedSearches" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "SavedSearches" ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update ComplianceReport table for enhanced compliance reporting
ALTER TABLE "ComplianceReport" ADD COLUMN "reportConfig" JSONB;
ALTER TABLE "ComplianceReport" ADD COLUMN "reportData" JSONB;
ALTER TABLE "ComplianceReport" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'COMPLETED';
ALTER TABLE "ComplianceReport" ADD COLUMN "complianceScore" DECIMAL(5,2);
ALTER TABLE "ComplianceReport" ADD COLUMN "riskLevel" TEXT;
ALTER TABLE "ComplianceReport" ADD COLUMN "reportPeriodStart" TIMESTAMP(3);
ALTER TABLE "ComplianceReport" ADD COLUMN "reportPeriodEnd" TIMESTAMP(3);
ALTER TABLE "ComplianceReport" ADD COLUMN "isScheduled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ComplianceReport" ADD COLUMN "scheduleFrequency" TEXT;
ALTER TABLE "ComplianceReport" ADD COLUMN "notes" TEXT;
ALTER TABLE "ComplianceReport" ADD COLUMN "reviewedBy" TEXT;
ALTER TABLE "ComplianceReport" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "ComplianceReport" ADD COLUMN "generatedByAdmin" UUID REFERENCES "Admin"("id");

-- Update AuditIntegrity table for enhanced integrity verification
ALTER TABLE "AuditIntegrity" ADD COLUMN "auditLogId" TEXT REFERENCES "AuditLog"("id");
ALTER TABLE "AuditIntegrity" ADD COLUMN "verificationStatus" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "AuditIntegrity" ADD COLUMN "hashVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AuditIntegrity" ADD COLUMN "chainVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AuditIntegrity" ADD COLUMN "timestampVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AuditIntegrity" ADD COLUMN "signatureVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AuditIntegrity" ADD COLUMN "verificationErrors" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "AuditIntegrity" ADD COLUMN "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "AuditIntegrity" ADD COLUMN "verificationMethod" TEXT;

-- Update AuditAlert table for security monitoring
ALTER TABLE "AuditAlert" ADD COLUMN "entityType" TEXT;
ALTER TABLE "AuditAlert" ADD COLUMN "entityId" TEXT;
ALTER TABLE "AuditAlert" ADD COLUMN "message" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AuditAlert" ADD COLUMN "riskScore" INTEGER;
ALTER TABLE "AuditAlert" ADD COLUMN "affectedEntities" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "AuditAlert" ADD COLUMN "remediationActions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update RetentionPolicy table for enhanced data retention
ALTER TABLE "RetentionPolicies" ADD COLUMN "entityTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "RetentionPolicies" ADD COLUMN "retentionPeriodDays" INTEGER NOT NULL DEFAULT 365;
ALTER TABLE "RetentionPolicies" ADD COLUMN "archiveAfterDays" INTEGER;
ALTER TABLE "RetentionPolicies" ADD COLUMN "compressionEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RetentionPolicies" ADD COLUMN "encryptionEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RetentionPolicies" ADD COLUMN "legalHoldExempt" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RetentionPolicies" ADD COLUMN "complianceStandards" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "RetentionPolicies" ADD COLUMN "deletionCriteria" JSONB;
ALTER TABLE "RetentionPolicies" ADD COLUMN "archivalSettings" JSONB;
ALTER TABLE "RetentionPolicies" ADD COLUMN "lastExecuted" TIMESTAMP(3);
ALTER TABLE "RetentionPolicies" ADD COLUMN "nextExecution" TIMESTAMP(3);

-- Update ArchivedRecord table for enhanced archival
ALTER TABLE "ArchivedRecords" ADD COLUMN "policyId" TEXT REFERENCES "RetentionPolicies"("id");
ALTER TABLE "ArchivedRecords" ADD COLUMN "recordCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ArchivedRecords" ADD COLUMN "compressedSize" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "ArchivedRecords" ADD COLUMN "originalSize" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "ArchivedRecords" ADD COLUMN "archiveFilePath" TEXT;
ALTER TABLE "ArchivedRecords" ADD COLUMN "checksumSHA256" TEXT;
ALTER TABLE "ArchivedRecords" ADD COLUMN "encryptionUsed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ArchivedRecords" ADD COLUMN "dateRangeStart" TIMESTAMP(3);
ALTER TABLE "ArchivedRecords" ADD COLUMN "dateRangeEnd" TIMESTAMP(3);
ALTER TABLE "ArchivedRecords" ADD COLUMN "entityTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ArchivedRecords" ADD COLUMN "searchIndex" JSONB;
ALTER TABLE "ArchivedRecords" ADD COLUMN "canRestore" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ArchivedRecords" ADD COLUMN "restorationComplexity" TEXT NOT NULL DEFAULT 'MEDIUM';

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS "SavedSearches_isPublic_idx" ON "SavedSearches"("isPublic");
CREATE INDEX IF NOT EXISTS "SavedSearches_tags_idx" ON "SavedSearches" USING GIN("tags");

CREATE INDEX IF NOT EXISTS "ComplianceReport_status_idx" ON "ComplianceReport"("status");
CREATE INDEX IF NOT EXISTS "ComplianceReport_complianceScore_idx" ON "ComplianceReport"("complianceScore");
CREATE INDEX IF NOT EXISTS "ComplianceReport_riskLevel_idx" ON "ComplianceReport"("riskLevel");
CREATE INDEX IF NOT EXISTS "ComplianceReport_reportPeriodStart_idx" ON "ComplianceReport"("reportPeriodStart");
CREATE INDEX IF NOT EXISTS "ComplianceReport_reportPeriodEnd_idx" ON "ComplianceReport"("reportPeriodEnd");
CREATE INDEX IF NOT EXISTS "ComplianceReport_isScheduled_idx" ON "ComplianceReport"("isScheduled");
CREATE INDEX IF NOT EXISTS "ComplianceReport_scheduleFrequency_idx" ON "ComplianceReport"("scheduleFrequency");

CREATE INDEX IF NOT EXISTS "AuditIntegrity_auditLogId_idx" ON "AuditIntegrity"("auditLogId");
CREATE INDEX IF NOT EXISTS "AuditIntegrity_verificationStatus_idx" ON "AuditIntegrity"("verificationStatus");
CREATE INDEX IF NOT EXISTS "AuditIntegrity_verifiedAt_idx" ON "AuditIntegrity"("verifiedAt");

CREATE INDEX IF NOT EXISTS "AuditAlert_entityType_idx" ON "AuditAlert"("entityType");
CREATE INDEX IF NOT EXISTS "AuditAlert_entityId_idx" ON "AuditAlert"("entityId");
CREATE INDEX IF NOT EXISTS "AuditAlert_riskScore_idx" ON "AuditAlert"("riskScore");

CREATE INDEX IF NOT EXISTS "RetentionPolicies_entityTypes_idx" ON "RetentionPolicies" USING GIN("entityTypes");
CREATE INDEX IF NOT EXISTS "RetentionPolicies_retentionPeriodDays_idx" ON "RetentionPolicies"("retentionPeriodDays");
CREATE INDEX IF NOT EXISTS "RetentionPolicies_lastExecuted_idx" ON "RetentionPolicies"("lastExecuted");
CREATE INDEX IF NOT EXISTS "RetentionPolicies_nextExecution_idx" ON "RetentionPolicies"("nextExecution");

CREATE INDEX IF NOT EXISTS "ArchivedRecords_policyId_idx" ON "ArchivedRecords"("policyId");
CREATE INDEX IF NOT EXISTS "ArchivedRecords_recordCount_idx" ON "ArchivedRecords"("recordCount");
CREATE INDEX IF NOT EXISTS "ArchivedRecords_dateRangeStart_idx" ON "ArchivedRecords"("dateRangeStart");
CREATE INDEX IF NOT EXISTS "ArchivedRecords_dateRangeEnd_idx" ON "ArchivedRecords"("dateRangeEnd");
CREATE INDEX IF NOT EXISTS "ArchivedRecords_entityTypes_idx" ON "ArchivedRecords" USING GIN("entityTypes");
CREATE INDEX IF NOT EXISTS "ArchivedRecords_canRestore_idx" ON "ArchivedRecords"("canRestore");
CREATE INDEX IF NOT EXISTS "ArchivedRecords_restorationComplexity_idx" ON "ArchivedRecords"("restorationComplexity");

-- Create Security Monitoring table for threat tracking
CREATE TABLE IF NOT EXISTS "SecurityThreats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threatType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affectedEntities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evidence" JSONB,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "remediationActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "SecurityThreats_threatType_idx" ON "SecurityThreats"("threatType");
CREATE INDEX IF NOT EXISTS "SecurityThreats_severity_idx" ON "SecurityThreats"("severity");
CREATE INDEX IF NOT EXISTS "SecurityThreats_status_idx" ON "SecurityThreats"("status");
CREATE INDEX IF NOT EXISTS "SecurityThreats_detectedAt_idx" ON "SecurityThreats"("detectedAt");
CREATE INDEX IF NOT EXISTS "SecurityThreats_riskScore_idx" ON "SecurityThreats"("riskScore");

-- Create Compliance Findings table for detailed compliance tracking
CREATE TABLE IF NOT EXISTS "ComplianceFindings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "findingType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "affectedEntities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ComplianceFindings_reportId_idx" ON "ComplianceFindings"("reportId");
CREATE INDEX IF NOT EXISTS "ComplianceFindings_findingType_idx" ON "ComplianceFindings"("findingType");
CREATE INDEX IF NOT EXISTS "ComplianceFindings_severity_idx" ON "ComplianceFindings"("severity");
CREATE INDEX IF NOT EXISTS "ComplianceFindings_status_idx" ON "ComplianceFindings"("status");
CREATE INDEX IF NOT EXISTS "ComplianceFindings_category_idx" ON "ComplianceFindings"("category");

-- Create Search Analytics table for search performance tracking
CREATE TABLE IF NOT EXISTS "SearchAnalytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchQuery" TEXT,
    "searchFilters" JSONB,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "executionTime" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "searchType" TEXT NOT NULL DEFAULT 'ADVANCED',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "SearchAnalytics_searchType_idx" ON "SearchAnalytics"("searchType");
CREATE INDEX IF NOT EXISTS "SearchAnalytics_userId_idx" ON "SearchAnalytics"("userId");
CREATE INDEX IF NOT EXISTS "SearchAnalytics_timestamp_idx" ON "SearchAnalytics"("timestamp");
CREATE INDEX IF NOT EXISTS "SearchAnalytics_executionTime_idx" ON "SearchAnalytics"("executionTime");

-- Create Security Events table for security event tracking
CREATE TABLE IF NOT EXISTS "SecurityEvents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "SecurityEvents_eventType_idx" ON "SecurityEvents"("eventType");
CREATE INDEX IF NOT EXISTS "SecurityEvents_severity_idx" ON "SecurityEvents"("severity");
CREATE INDEX IF NOT EXISTS "SecurityEvents_source_idx" ON "SecurityEvents"("source");
CREATE INDEX IF NOT EXISTS "SecurityEvents_userId_idx" ON "SecurityEvents"("userId");
CREATE INDEX IF NOT EXISTS "SecurityEvents_timestamp_idx" ON "SecurityEvents"("timestamp");
CREATE INDEX IF NOT EXISTS "SecurityEvents_resolved_idx" ON "SecurityEvents"("resolved");

-- Alter AuditLog table to add location and device info
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "location" JSONB;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "deviceInfo" JSONB;

CREATE INDEX IF NOT EXISTS "AuditLog_location_idx" ON "AuditLog" USING GIN("location");
CREATE INDEX IF NOT EXISTS "AuditLog_deviceInfo_idx" ON "AuditLog" USING GIN("deviceInfo");