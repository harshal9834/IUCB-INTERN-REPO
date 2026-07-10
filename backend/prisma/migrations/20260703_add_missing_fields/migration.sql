-- Add missing enum values
DO $$ BEGIN
  CREATE TYPE "ApplicationType" AS ENUM ('ACCREDITATION', 'AUDITOR', 'TRAINING_INSTITUTE', 'ADVISORY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add SUSPENDED to CredentialStatus if missing
ALTER TYPE "CredentialStatus" ADD VALUE IF NOT EXISTS 'SUSPENDED';

-- Add missing columns to AdvisoryApplication table
ALTER TABLE "AdvisoryApplication" 
ADD COLUMN IF NOT EXISTS "applicationNumber" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "applicationType" "ApplicationType" DEFAULT 'ADVISORY',
ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT,
ADD COLUMN IF NOT EXISTS "country" TEXT,
ADD COLUMN IF NOT EXISTS "address" TEXT,
ADD COLUMN IF NOT EXISTS "organizationType" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "website" TEXT,
ADD COLUMN IF NOT EXISTS "appliedStandard" TEXT,
ADD COLUMN IF NOT EXISTS "message" TEXT,
ADD COLUMN IF NOT EXISTS "internalNotes" TEXT,
ADD COLUMN IF NOT EXISTS "credentialGenerated" BOOLEAN DEFAULT false;

-- Update company column to be nullable
ALTER TABLE "AdvisoryApplication" ALTER COLUMN "company" DROP NOT NULL;

-- Update designation column to be nullable  
ALTER TABLE "AdvisoryApplication" ALTER COLUMN "designation" DROP NOT NULL;

-- Update expertiseArea column to be nullable
ALTER TABLE "AdvisoryApplication" ALTER COLUMN "expertiseArea" DROP NOT NULL;

-- Update experienceYears column to be nullable
ALTER TABLE "AdvisoryApplication" ALTER COLUMN "experienceYears" DROP NOT NULL;

-- Update statementOfMerit column to be nullable
ALTER TABLE "AdvisoryApplication" ALTER COLUMN "statementOfMerit" DROP NOT NULL;

-- Update email to not be unique (allow multiple applications from same email)
ALTER TABLE "AdvisoryApplication" DROP CONSTRAINT IF EXISTS "AdvisoryApplication_email_key";

-- Add index for applicationNumber
CREATE INDEX IF NOT EXISTS "AdvisoryApplication_applicationNumber_idx" ON "AdvisoryApplication"("applicationNumber");

-- Add index for applicationType  
CREATE INDEX IF NOT EXISTS "AdvisoryApplication_applicationType_idx" ON "AdvisoryApplication"("applicationType");

-- Fix Advisor table relation column name
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Advisor' AND column_name = 'advisoryApplicationId'
  ) THEN
    ALTER TABLE "Advisor" RENAME COLUMN "advisoryApplicationId" TO "applicationId";
  END IF;
END $$;

-- Update unique constraint for Advisor
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'Advisor_advisoryApplicationId_key') THEN
    ALTER TABLE "Advisor" DROP CONSTRAINT "Advisor_advisoryApplicationId_key";
  END IF;
END $$;

ALTER TABLE "Advisor" ADD CONSTRAINT "Advisor_applicationId_key" UNIQUE ("applicationId");

-- Create TrainingInstitute table if not exists
CREATE TABLE IF NOT EXISTS "TrainingInstitute" (
    "id" UUID NOT NULL,
    "instituteName" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL UNIQUE,
    "country" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    
    CONSTRAINT "TrainingInstitute_pkey" PRIMARY KEY ("id")
);

-- Create indexes for TrainingInstitute
CREATE INDEX IF NOT EXISTS "TrainingInstitute_instituteName_idx" ON "TrainingInstitute"("instituteName");
CREATE INDEX IF NOT EXISTS "TrainingInstitute_registrationNumber_idx" ON "TrainingInstitute"("registrationNumber");
CREATE INDEX IF NOT EXISTS "TrainingInstitute_status_idx" ON "TrainingInstitute"("status");
CREATE INDEX IF NOT EXISTS "TrainingInstitute_createdAt_idx" ON "TrainingInstitute"("createdAt");
