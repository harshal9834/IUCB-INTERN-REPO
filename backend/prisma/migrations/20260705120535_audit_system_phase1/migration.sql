/*
  Warnings:

  - The `action` column on the `AuditLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `applicationType` on table `AdvisoryApplication` required. This step will fail if there are existing NULL values in that column.
  - Made the column `credentialGenerated` on table `AdvisoryApplication` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_CHANGE', 'PASSWORD_RESET', 'STATUS_CHANGE', 'APPROVE', 'REJECT', 'GENERATE', 'SEND_EMAIL', 'DOWNLOAD', 'UPLOAD', 'EXPORT', 'IMPORT', 'BULK_UPDATE', 'BULK_DELETE', 'ROLE_CHANGE', 'PERMISSION_CHANGE');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('MULTIPLE_FAILED_LOGINS', 'UNUSUAL_LOCATION', 'PRIVILEGE_ESCALATION', 'MASS_DELETE', 'MASS_UPDATE', 'BRUTE_FORCE', 'SECURITY_BREACH', 'INTEGRITY_VIOLATION', 'SYSTEM_ERROR');

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_adminId_fkey";

-- DropIndex
DROP INDEX "AdvisoryApplication_applicationNumber_idx";

-- DropIndex
DROP INDEX "AdvisoryApplication_email_key";

-- DropIndex
DROP INDEX "AuditLog_adminId_idx";

-- DropIndex
DROP INDEX "AuditLog_timestamp_idx";

-- AlterTable
ALTER TABLE "AdvisoryApplication" ALTER COLUMN "applicationType" SET NOT NULL,
ALTER COLUMN "credentialGenerated" SET NOT NULL;

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "actorId" UUID,
ADD COLUMN     "actorName" TEXT,
ADD COLUMN     "actorRole" "AdminRole",
ADD COLUMN     "browser" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "hash" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "module" TEXT,
ADD COLUMN     "newValues" JSONB,
ADD COLUMN     "oldValues" JSONB,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "previousHash" TEXT,
ADD COLUMN     "requestId" TEXT,
ADD COLUMN     "riskScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "severity" "AuditSeverity" NOT NULL DEFAULT 'LOW',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SUCCESS',
DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction",
ALTER COLUMN "timestamp" DROP NOT NULL,
ALTER COLUMN "timestamp" DROP DEFAULT;

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "eventType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditSnapshot" (
    "id" UUID NOT NULL,
    "auditLogId" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditIntegrity" (
    "id" UUID NOT NULL,
    "chainHash" TEXT NOT NULL,
    "blockCount" INTEGER NOT NULL DEFAULT 0,
    "lastVerified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditIntegrity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditAlert" (
    "id" UUID NOT NULL,
    "auditLogId" UUID,
    "alertType" "AlertType" NOT NULL,
    "severity" "AuditSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedTo" UUID,
    "resolvedBy" UUID,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceReport" (
    "id" UUID NOT NULL,
    "reportType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "parameters" JSONB,
    "generatedBy" UUID,
    "filePath" TEXT,
    "fileFormat" TEXT NOT NULL,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "dateFrom" TIMESTAMP(3) NOT NULL,
    "dateTo" TIMESTAMP(3) NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplianceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsSnapshot" (
    "id" UUID NOT NULL,
    "snapshotType" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySummary" (
    "id" UUID NOT NULL,
    "adminId" UUID,
    "entityType" TEXT,
    "action" TEXT,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivitySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditEvent_eventType_idx" ON "AuditEvent"("eventType");

-- CreateIndex
CREATE INDEX "AuditEvent_category_idx" ON "AuditEvent"("category");

-- CreateIndex
CREATE INDEX "AuditEvent_timestamp_idx" ON "AuditEvent"("timestamp");

-- CreateIndex
CREATE INDEX "AuditSnapshot_entityType_idx" ON "AuditSnapshot"("entityType");

-- CreateIndex
CREATE INDEX "AuditSnapshot_entityId_idx" ON "AuditSnapshot"("entityId");

-- CreateIndex
CREATE INDEX "AuditSnapshot_timestamp_idx" ON "AuditSnapshot"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "AuditIntegrity_chainHash_key" ON "AuditIntegrity"("chainHash");

-- CreateIndex
CREATE INDEX "AuditIntegrity_chainHash_idx" ON "AuditIntegrity"("chainHash");

-- CreateIndex
CREATE INDEX "AuditIntegrity_lastVerified_idx" ON "AuditIntegrity"("lastVerified");

-- CreateIndex
CREATE INDEX "AuditIntegrity_isValid_idx" ON "AuditIntegrity"("isValid");

-- CreateIndex
CREATE INDEX "AuditAlert_alertType_idx" ON "AuditAlert"("alertType");

-- CreateIndex
CREATE INDEX "AuditAlert_severity_idx" ON "AuditAlert"("severity");

-- CreateIndex
CREATE INDEX "AuditAlert_status_idx" ON "AuditAlert"("status");

-- CreateIndex
CREATE INDEX "AuditAlert_createdAt_idx" ON "AuditAlert"("createdAt");

-- CreateIndex
CREATE INDEX "ComplianceReport_reportType_idx" ON "ComplianceReport"("reportType");

-- CreateIndex
CREATE INDEX "ComplianceReport_generatedBy_idx" ON "ComplianceReport"("generatedBy");

-- CreateIndex
CREATE INDEX "ComplianceReport_generatedAt_idx" ON "ComplianceReport"("generatedAt");

-- CreateIndex
CREATE INDEX "ComplianceReport_dateFrom_idx" ON "ComplianceReport"("dateFrom");

-- CreateIndex
CREATE INDEX "ComplianceReport_dateTo_idx" ON "ComplianceReport"("dateTo");

-- CreateIndex
CREATE INDEX "AnalyticsSnapshot_snapshotType_idx" ON "AnalyticsSnapshot"("snapshotType");

-- CreateIndex
CREATE INDEX "AnalyticsSnapshot_period_idx" ON "AnalyticsSnapshot"("period");

-- CreateIndex
CREATE INDEX "AnalyticsSnapshot_createdAt_idx" ON "AnalyticsSnapshot"("createdAt");

-- CreateIndex
CREATE INDEX "ActivitySummary_adminId_idx" ON "ActivitySummary"("adminId");

-- CreateIndex
CREATE INDEX "ActivitySummary_entityType_idx" ON "ActivitySummary"("entityType");

-- CreateIndex
CREATE INDEX "ActivitySummary_action_idx" ON "ActivitySummary"("action");

-- CreateIndex
CREATE INDEX "ActivitySummary_date_idx" ON "ActivitySummary"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySummary_adminId_entityType_action_date_key" ON "ActivitySummary"("adminId", "entityType", "action", "date");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");

-- CreateIndex
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");

-- CreateIndex
CREATE INDEX "AuditLog_status_idx" ON "AuditLog"("status");

-- CreateIndex
CREATE INDEX "AuditLog_riskScore_idx" ON "AuditLog"("riskScore");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_sessionId_idx" ON "AuditLog"("sessionId");

-- CreateIndex
CREATE INDEX "AuditLog_ipAddress_idx" ON "AuditLog"("ipAddress");

-- RenameForeignKey
ALTER TABLE "Advisor" RENAME CONSTRAINT "Advisor_advisoryApplicationId_fkey" TO "Advisor_applicationId_fkey";

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditSnapshot" ADD CONSTRAINT "AuditSnapshot_auditLogId_fkey" FOREIGN KEY ("auditLogId") REFERENCES "AuditLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAlert" ADD CONSTRAINT "AuditAlert_auditLogId_fkey" FOREIGN KEY ("auditLogId") REFERENCES "AuditLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAlert" ADD CONSTRAINT "AuditAlert_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAlert" ADD CONSTRAINT "AuditAlert_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceReport" ADD CONSTRAINT "ComplianceReport_generatedBy_fkey" FOREIGN KEY ("generatedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySummary" ADD CONSTRAINT "ActivitySummary_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
