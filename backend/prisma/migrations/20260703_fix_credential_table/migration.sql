-- Add missing columns to Credential table
ALTER TABLE "Credential" 
ADD COLUMN IF NOT EXISTS "certificateGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "certificatePath" TEXT,
ADD COLUMN IF NOT EXISTS "generatedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "generatedById" UUID;

-- Make organizationId and auditorId nullable
ALTER TABLE "Credential" 
ALTER COLUMN "organizationId" DROP NOT NULL,
ALTER COLUMN "auditorId" DROP NOT NULL;

-- Add applicationId unique constraint and foreign key
ALTER TABLE "Credential" 
ADD COLUMN IF NOT EXISTS "applicationId" UUID UNIQUE;

-- Add foreign key for applicationId if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Credential_applicationId_fkey'
  ) THEN
    ALTER TABLE "Credential" ADD CONSTRAINT "Credential_applicationId_fkey" 
    FOREIGN KEY ("applicationId") REFERENCES "AdvisoryApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add foreign key for generatedById if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'Credential_generatedById_fkey'
  ) THEN
    ALTER TABLE "Credential" ADD CONSTRAINT "Credential_generatedById_fkey" 
    FOREIGN KEY ("generatedById") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Add missing foreign keys and columns to EmailLog
ALTER TABLE "EmailLog" 
ADD COLUMN IF NOT EXISTS "credentialId" UUID;

-- Add foreign key for EmailLog.credentialId if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'EmailLog_credentialId_fkey'
  ) THEN
    ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_credentialId_fkey" 
    FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS "EmailLog_credentialId_idx" ON "EmailLog"("credentialId");
