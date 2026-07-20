import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("🧹 Cleaning all business data from database...\n");

  try {
    // Delete in proper order to respect foreign keys

    // 1. Bulk Email tables
    await prisma.bulkEmailCredential.deleteMany({});
    await prisma.bulkEmailCampaign.deleteMany({});
    console.log("✅ Deleted Bulk Email data");

    // 2. Audit system tables
    await prisma.auditSnapshot.deleteMany({});
    await prisma.auditAlert.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.auditEvent.deleteMany({});
    await prisma.auditIntegrity.deleteMany({});
    console.log("✅ Deleted Audit system data");

    // 3. History & Export tables
    await prisma.changeLog.deleteMany({});
    await prisma.entityHistory.deleteMany({});
    await prisma.archivedRecord.deleteMany({});
    await prisma.dataExport.deleteMany({});
    await prisma.complianceReport.deleteMany({});
    console.log("✅ Deleted History and Export data");

    // 4. Search & Analytics
    await prisma.searchIndex.deleteMany({});
    await prisma.savedSearch.deleteMany({});
    await prisma.analyticsSnapshot.deleteMany({});
    await prisma.activitySummary.deleteMany({});
    console.log("✅ Deleted Search and Analytics data");

    // 5. Core business tables
    await prisma.emailLog.deleteMany({});
    await prisma.credential.deleteMany({});
    await prisma.advisor.deleteMany({});
    await prisma.application.deleteMany({});
    await prisma.auditor.deleteMany({});
    await prisma.organization.deleteMany({});
    await prisma.trainingInstitute.deleteMany({});
    console.log("✅ Deleted Core Business data");

    // 6. Content tables
    await prisma.resource.deleteMany({});
    await prisma.certificateTemplate.deleteMany({});
    await prisma.news.deleteMany({});
    console.log("✅ Deleted Content data");

    // 7. System/Auth tables
    await prisma.refreshToken.deleteMany({});
    await prisma.retentionPolicy.deleteMany({});
    console.log("✅ Deleted System/Auth data");

    // 8. Keep only one Super Admin, delete all others
    const admins = await prisma.admin.findMany({});
    const superAdmin = admins.find(a => a.email === "admin@iucb.org");
    
    if (superAdmin) {
      await prisma.admin.deleteMany({
        where: {
          id: { not: superAdmin.id }
        }
      });
      console.log("✅ Kept only Super Admin (admin@iucb.org), deleted others");
    } else {
      console.log("⚠️  No Super Admin found with email admin@iucb.org");
    }

    // Keep system settings
    console.log("✅ Kept system settings");

    console.log("\n✅ Database cleaned successfully!");
    
    const counts = {
      admins: await prisma.admin.count(),
      organizations: await prisma.organization.count(),
      auditors: await prisma.auditor.count(),
      credentials: await prisma.credential.count(),
      applications: await prisma.application.count(),
      advisors: await prisma.advisor.count(),
      trainingInstitutes: await prisma.trainingInstitute.count(),
      news: await prisma.news.count(),
      resources: await prisma.resource.count(),
      auditLogs: await prisma.auditLog.count(),
      certificateTemplates: await prisma.certificateTemplate.count(),
      activitySummaries: await prisma.activitySummary.count(),
    };

    console.log("📊 Remaining records:");
    console.log(JSON.stringify(counts, null, 2));

  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
