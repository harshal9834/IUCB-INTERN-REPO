-- Phase 3: Entity History Tables
CREATE TABLE IF NOT EXISTS "EntityHistories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" INTEGER DEFAULT 1,
    "action" TEXT NOT NULL,
    "changedBy" UUID,
    "changeTimestamp" TIMESTAMPTZ DEFAULT NOW(),
    "beforeData" JSONB,
    "afterData" JSONB,
    "changedFields" JSONB,
    "description" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    
    CONSTRAINT "EntityHistories_changedBy_fkey"
        FOREIGN KEY ("changedBy") REFERENCES "Admin"("id") ON DELETE SET NULL,
    
    UNIQUE("entityId", "entityType", "version")
);

CREATE INDEX "idx_entity_histories_entity_type" ON "EntityHistories"("entityType");
CREATE INDEX "idx_entity_histories_entity_id" ON "EntityHistories"("entityId");
CREATE INDEX "idx_entity_histories_version" ON "EntityHistories"("version");
CREATE INDEX "idx_entity_histories_change_timestamp" ON "EntityHistories"("changeTimestamp");
CREATE INDEX "idx_entity_histories_action" ON "EntityHistories"("action");
CREATE INDEX "idx_entity_histories_changed_by" ON "EntityHistories"("changedBy");

CREATE TABLE IF NOT EXISTS "ChangeLogs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "entityHistoryId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changeType" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT "ChangeLogs_entityHistoryId_fkey"
        FOREIGN KEY ("entityHistoryId") REFERENCES "EntityHistories"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_change_logs_entity_history_id" ON "ChangeLogs"("entityHistoryId");
CREATE INDEX "idx_change_logs_entity_type" ON "ChangeLogs"("entityType");
CREATE INDEX "idx_change_logs_entity_id" ON "ChangeLogs"("entityId");
CREATE INDEX "idx_change_logs_field_name" ON "ChangeLogs"("fieldName");
CREATE INDEX "idx_change_logs_timestamp" ON "ChangeLogs"("timestamp");

-- Phase 5: Search Index and Saved Searches
CREATE TABLE IF NOT EXISTS "SearchIndices" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "searchText" TEXT,
    "tags" JSONB,
    "metadata" JSONB,
    "lastUpdated" TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE("entityType", "entityId")
);

CREATE INDEX "idx_search_indices_entity_type" ON "SearchIndices"("entityType");
CREATE INDEX "idx_search_indices_entity_id" ON "SearchIndices"("entityId");
CREATE INDEX "idx_search_indices_last_updated" ON "SearchIndices"("lastUpdated");
CREATE INDEX "idx_search_indices_search_text" ON "SearchIndices" USING GIN (to_tsvector('english', "searchText"));

CREATE TABLE IF NOT EXISTS "SavedSearches" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "filters" JSONB NOT NULL,
    "createdBy" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    "lastUsed" TIMESTAMPTZ,
    "useCount" INTEGER DEFAULT 0,
    
    CONSTRAINT "SavedSearches_createdBy_fkey"
        FOREIGN KEY ("createdBy") REFERENCES "Admin"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_saved_searches_created_by" ON "SavedSearches"("createdBy");
CREATE INDEX "idx_saved_searches_created_at" ON "SavedSearches"("createdAt");
CREATE INDEX "idx_saved_searches_last_used" ON "SavedSearches"("lastUsed");

-- Phase 9: Retention Policies and Archival
CREATE TABLE IF NOT EXISTS "RetentionPolicies" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "entityType" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL,
    "deleteAction" TEXT NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdBy" UUID,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT "RetentionPolicies_createdBy_fkey"
        FOREIGN KEY ("createdBy") REFERENCES "Admin"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_retention_policies_entity_type" ON "RetentionPolicies"("entityType");
CREATE INDEX "idx_retention_policies_is_active" ON "RetentionPolicies"("isActive");

CREATE TABLE IF NOT EXISTS "ArchivedRecords" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT,
    "data" JSONB NOT NULL,
    "archivedAt" TIMESTAMPTZ DEFAULT NOW(),
    "archivedBy" UUID,
    "reason" TEXT,
    "restoreInfo" JSONB,
    "isRestored" BOOLEAN DEFAULT false,
    "restoredAt" TIMESTAMPTZ,
    "restoredBy" UUID,
    
    CONSTRAINT "ArchivedRecords_archivedBy_fkey"
        FOREIGN KEY ("archivedBy") REFERENCES "Admin"("id") ON DELETE SET NULL,
    
    CONSTRAINT "ArchivedRecords_restoredBy_fkey"
        FOREIGN KEY ("restoredBy") REFERENCES "Admin"("id") ON DELETE SET NULL
);

CREATE INDEX "idx_archived_records_entity_type" ON "ArchivedRecords"("entityType");
CREATE INDEX "idx_archived_records_entity_id" ON "ArchivedRecords"("entityId");
CREATE INDEX "idx_archived_records_archived_at" ON "ArchivedRecords"("archivedAt");
CREATE INDEX "idx_archived_records_is_restored" ON "ArchivedRecords"("isRestored");

CREATE TABLE IF NOT EXISTS "DataExports" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "exportType" TEXT NOT NULL,
    "entityType" TEXT,
    "filters" JSONB,
    "recordCount" INTEGER DEFAULT 0,
    "filePath" TEXT,
    "fileSize" INTEGER,
    "status" TEXT DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "requestedBy" UUID NOT NULL,
    "requestedAt" TIMESTAMPTZ DEFAULT NOW(),
    "completedAt" TIMESTAMPTZ,
    "expiresAt" TIMESTAMPTZ,
    "downloadCount" INTEGER DEFAULT 0,
    
    CONSTRAINT "DataExports_requestedBy_fkey"
        FOREIGN KEY ("requestedBy") REFERENCES "Admin"("id") ON DELETE CASCADE
);

CREATE INDEX "idx_data_exports_entity_type" ON "DataExports"("entityType");
CREATE INDEX "idx_data_exports_status" ON "DataExports"("status");
CREATE INDEX "idx_data_exports_requested_by" ON "DataExports"("requestedBy");
CREATE INDEX "idx_data_exports_requested_at" ON "DataExports"("requestedAt");

-- Update Admin model relationships
-- Add foreign key constraints for existing relationships that reference Admin
ALTER TABLE IF EXISTS "EntityHistories" 
ADD CONSTRAINT "FK_EntityHistories_Admin" 
FOREIGN KEY ("changedBy") REFERENCES "Admin"("id") ON DELETE SET NULL;

-- Create indexes for full-text search support
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS "idx_search_text_trigram" ON "SearchIndices" USING GIN ("searchText" gin_trgm_ops);