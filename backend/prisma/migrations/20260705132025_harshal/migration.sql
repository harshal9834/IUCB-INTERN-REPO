/*
  Warnings:

  - Made the column `archivedAt` on table `ArchivedRecords` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isRestored` on table `ArchivedRecords` required. This step will fail if there are existing NULL values in that column.
  - Made the column `timestamp` on table `ChangeLogs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `recordCount` on table `DataExports` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `DataExports` required. This step will fail if there are existing NULL values in that column.
  - Made the column `requestedAt` on table `DataExports` required. This step will fail if there are existing NULL values in that column.
  - Made the column `downloadCount` on table `DataExports` required. This step will fail if there are existing NULL values in that column.
  - Made the column `version` on table `EntityHistories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `changeTimestamp` on table `EntityHistories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isActive` on table `RetentionPolicies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `RetentionPolicies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `RetentionPolicies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `SavedSearches` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `SavedSearches` required. This step will fail if there are existing NULL values in that column.
  - Made the column `useCount` on table `SavedSearches` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastUpdated` on table `SearchIndices` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ArchivedRecords" DROP CONSTRAINT "ArchivedRecords_archivedBy_fkey";

-- DropForeignKey
ALTER TABLE "ArchivedRecords" DROP CONSTRAINT "ArchivedRecords_restoredBy_fkey";

-- DropForeignKey
ALTER TABLE "ChangeLogs" DROP CONSTRAINT "ChangeLogs_entityHistoryId_fkey";

-- DropForeignKey
ALTER TABLE "DataExports" DROP CONSTRAINT "DataExports_requestedBy_fkey";

-- DropForeignKey
ALTER TABLE "EntityHistories" DROP CONSTRAINT "EntityHistories_changedBy_fkey";

-- DropForeignKey
ALTER TABLE "EntityHistories" DROP CONSTRAINT "FK_EntityHistories_Admin";

-- DropForeignKey
ALTER TABLE "RetentionPolicies" DROP CONSTRAINT "RetentionPolicies_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "SavedSearches" DROP CONSTRAINT "SavedSearches_createdBy_fkey";

-- DropIndex
DROP INDEX "idx_search_text_trigram";

-- AlterTable
ALTER TABLE "ArchivedRecords" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "archivedAt" SET NOT NULL,
ALTER COLUMN "archivedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "isRestored" SET NOT NULL,
ALTER COLUMN "restoredAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ChangeLogs" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "timestamp" SET NOT NULL,
ALTER COLUMN "timestamp" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "DataExports" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "recordCount" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "requestedAt" SET NOT NULL,
ALTER COLUMN "requestedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "completedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "expiresAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "downloadCount" SET NOT NULL;

-- AlterTable
ALTER TABLE "EntityHistories" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "version" SET NOT NULL,
ALTER COLUMN "changeTimestamp" SET NOT NULL,
ALTER COLUMN "changeTimestamp" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "RetentionPolicies" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SavedSearches" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "lastUsed" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "useCount" SET NOT NULL;

-- AlterTable
ALTER TABLE "SearchIndices" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "lastUpdated" SET NOT NULL,
ALTER COLUMN "lastUpdated" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "EntityHistories" ADD CONSTRAINT "EntityHistories_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearches" ADD CONSTRAINT "SavedSearches_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetentionPolicies" ADD CONSTRAINT "RetentionPolicies_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivedRecords" ADD CONSTRAINT "ArchivedRecords_archivedBy_fkey" FOREIGN KEY ("archivedBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchivedRecords" ADD CONSTRAINT "ArchivedRecords_restoredBy_fkey" FOREIGN KEY ("restoredBy") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExports" ADD CONSTRAINT "DataExports_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_archived_records_archived_at" RENAME TO "ArchivedRecords_archivedAt_idx";

-- RenameIndex
ALTER INDEX "idx_archived_records_entity_id" RENAME TO "ArchivedRecords_entityId_idx";

-- RenameIndex
ALTER INDEX "idx_archived_records_entity_type" RENAME TO "ArchivedRecords_entityType_idx";

-- RenameIndex
ALTER INDEX "idx_archived_records_is_restored" RENAME TO "ArchivedRecords_isRestored_idx";

-- RenameIndex
ALTER INDEX "idx_change_logs_entity_history_id" RENAME TO "ChangeLogs_entityHistoryId_idx";

-- RenameIndex
ALTER INDEX "idx_change_logs_entity_id" RENAME TO "ChangeLogs_entityId_idx";

-- RenameIndex
ALTER INDEX "idx_change_logs_entity_type" RENAME TO "ChangeLogs_entityType_idx";

-- RenameIndex
ALTER INDEX "idx_change_logs_field_name" RENAME TO "ChangeLogs_fieldName_idx";

-- RenameIndex
ALTER INDEX "idx_change_logs_timestamp" RENAME TO "ChangeLogs_timestamp_idx";

-- RenameIndex
ALTER INDEX "idx_data_exports_entity_type" RENAME TO "DataExports_entityType_idx";

-- RenameIndex
ALTER INDEX "idx_data_exports_requested_at" RENAME TO "DataExports_requestedAt_idx";

-- RenameIndex
ALTER INDEX "idx_data_exports_requested_by" RENAME TO "DataExports_requestedBy_idx";

-- RenameIndex
ALTER INDEX "idx_data_exports_status" RENAME TO "DataExports_status_idx";

-- RenameIndex
ALTER INDEX "idx_entity_histories_action" RENAME TO "EntityHistories_action_idx";

-- RenameIndex
ALTER INDEX "idx_entity_histories_change_timestamp" RENAME TO "EntityHistories_changeTimestamp_idx";

-- RenameIndex
ALTER INDEX "idx_entity_histories_changed_by" RENAME TO "EntityHistories_changedBy_idx";

-- RenameIndex
ALTER INDEX "idx_entity_histories_entity_id" RENAME TO "EntityHistories_entityId_idx";

-- RenameIndex
ALTER INDEX "idx_entity_histories_entity_type" RENAME TO "EntityHistories_entityType_idx";

-- RenameIndex
ALTER INDEX "idx_entity_histories_version" RENAME TO "EntityHistories_version_idx";

-- RenameIndex
ALTER INDEX "idx_retention_policies_entity_type" RENAME TO "RetentionPolicies_entityType_idx";

-- RenameIndex
ALTER INDEX "idx_retention_policies_is_active" RENAME TO "RetentionPolicies_isActive_idx";

-- RenameIndex
ALTER INDEX "idx_saved_searches_created_at" RENAME TO "SavedSearches_createdAt_idx";

-- RenameIndex
ALTER INDEX "idx_saved_searches_created_by" RENAME TO "SavedSearches_createdBy_idx";

-- RenameIndex
ALTER INDEX "idx_saved_searches_last_used" RENAME TO "SavedSearches_lastUsed_idx";

-- RenameIndex
ALTER INDEX "idx_search_indices_entity_id" RENAME TO "SearchIndices_entityId_idx";

-- RenameIndex
ALTER INDEX "idx_search_indices_entity_type" RENAME TO "SearchIndices_entityType_idx";

-- RenameIndex
ALTER INDEX "idx_search_indices_last_updated" RENAME TO "SearchIndices_lastUpdated_idx";
