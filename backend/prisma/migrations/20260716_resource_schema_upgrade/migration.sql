-- Resource table schema upgrade
-- Adds new file metadata columns, drops old fileUrl column
-- Handles existing rows by backfilling defaults before making columns NOT NULL

-- Step 1: Add new columns as NULLABLE first
ALTER TABLE "Resource" ADD COLUMN IF NOT EXISTS "filename"     TEXT;
ALTER TABLE "Resource" ADD COLUMN IF NOT EXISTS "filepath"     TEXT;
ALTER TABLE "Resource" ADD COLUMN IF NOT EXISTS "filesize"     INTEGER;
ALTER TABLE "Resource" ADD COLUMN IF NOT EXISTS "filetype"     TEXT;
ALTER TABLE "Resource" ADD COLUMN IF NOT EXISTS "version"      TEXT;
ALTER TABLE "Resource" ADD COLUMN IF NOT EXISTS "language"     TEXT NOT NULL DEFAULT 'English';
ALTER TABLE "Resource" ADD COLUMN IF NOT EXISTS "status"       TEXT NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "Resource" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Resource" ADD COLUMN IF NOT EXISTS "downloads"    INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Resource" ADD COLUMN IF NOT EXISTS "publishedAt"  TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE "Resource" ADD COLUMN IF NOT EXISTS "createdBy"    UUID;

-- Step 2: Backfill existing rows that have fileUrl (old column)
UPDATE "Resource"
SET
  "filename"  = COALESCE(NULLIF("fileUrl", ''), 'legacy-file.pdf'),
  "filepath"  = COALESCE(NULLIF("fileUrl", ''), 'legacy/legacy-file.pdf'),
  "filesize"  = 0,
  "filetype"  = 'PDF'
WHERE "filename" IS NULL;

-- Step 3: Make required columns NOT NULL now that all rows have values
ALTER TABLE "Resource" ALTER COLUMN "filename"  SET NOT NULL;
ALTER TABLE "Resource" ALTER COLUMN "filepath"  SET NOT NULL;
ALTER TABLE "Resource" ALTER COLUMN "filesize"  SET NOT NULL;
ALTER TABLE "Resource" ALTER COLUMN "filetype"  SET NOT NULL;

-- Step 4: Drop old column that no longer exists in schema
ALTER TABLE "Resource" DROP COLUMN IF EXISTS "fileUrl";

-- Step 5: Add foreign key for createdBy -> Admin
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "Admin"("id") ON DELETE SET NULL;

-- Step 6: Add new indexes
CREATE INDEX IF NOT EXISTS "Resource_status_idx" ON "Resource"("status");

-- CertificateTemplate table (new model from completed-dash)
CREATE TABLE IF NOT EXISTS "CertificateTemplate" (
  "id"           UUID NOT NULL DEFAULT gen_random_uuid(),
  "title"        TEXT NOT NULL,
  "description"  TEXT,
  "detectedType" TEXT NOT NULL,
  "version"      TEXT,
  "status"       TEXT NOT NULL DEFAULT 'ARCHIVED',
  "filename"     TEXT NOT NULL,
  "filepath"     TEXT NOT NULL,
  "placeholders" JSONB,
  "uploadedBy"   UUID,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "CertificateTemplate_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CertificateTemplate" ADD CONSTRAINT "CertificateTemplate_uploadedBy_fkey"
  FOREIGN KEY ("uploadedBy") REFERENCES "Admin"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "CertificateTemplate_detectedType_idx" ON "CertificateTemplate"("detectedType");
CREATE INDEX IF NOT EXISTS "CertificateTemplate_status_idx" ON "CertificateTemplate"("status");

-- Credential new fields (from completed-dash)
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "certificateId"       TEXT;
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "registrationNumber"  TEXT;
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "candidateName"       TEXT;
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "organizationName"    TEXT;
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "emailSent"           BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "emailSentAt"         TIMESTAMPTZ;
ALTER TABLE "Credential" ADD COLUMN IF NOT EXISTS "emailSentBy"         TEXT;

-- Unique constraints on Credential new fields (only if there are no conflicts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Credential_certificateId_key'
  ) THEN
    ALTER TABLE "Credential" ADD CONSTRAINT "Credential_certificateId_key" UNIQUE ("certificateId");
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Credential_registrationNumber_key'
  ) THEN
    ALTER TABLE "Credential" ADD CONSTRAINT "Credential_registrationNumber_key" UNIQUE ("registrationNumber");
  END IF;
END $$;

-- Admin new relation columns (certificateTemplates relation already handled via CertificateTemplate.uploadedBy)
-- Resource.createdBy relation already added above

-- Mark migration as applied in Prisma migrations table
