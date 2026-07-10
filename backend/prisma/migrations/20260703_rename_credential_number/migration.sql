-- DropIndex
DROP INDEX "Credential_credentialNumber_idx";

-- DropIndex
DROP INDEX "Credential_credentialNumber_key";

-- AlterTable
ALTER TABLE "Credential" RENAME COLUMN "credentialNumber" TO "credentialId";

-- CreateIndex
CREATE UNIQUE INDEX "Credential_credentialId_key" ON "Credential"("credentialId");

-- CreateIndex
CREATE INDEX "Credential_credentialId_idx" ON "Credential"("credentialId");
