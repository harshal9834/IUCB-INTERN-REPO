import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("🧹 Cleaning all dummy data from database...\n");

  try {
    // Delete in proper order to respect foreign keys
    await prisma.emailLog.deleteMany({});
    console.log("✅ Deleted all email logs");

    await prisma.auditLog.deleteMany({});
    console.log("✅ Deleted all audit logs");

    await prisma.resource.deleteMany({});
    console.log("✅ Deleted all resources");

    await prisma.news.deleteMany({});
    console.log("✅ Deleted all news articles");

    await prisma.advisor.deleteMany({});
    console.log("✅ Deleted all advisors");

    await prisma.application.deleteMany({});
    console.log("✅ Deleted all applications");

    await prisma.credential.deleteMany({});
    console.log("✅ Deleted all credentials");

    await prisma.auditor.deleteMany({});
    console.log("✅ Deleted all auditors");

    await prisma.organization.deleteMany({});
    console.log("✅ Deleted all organizations");

    await prisma.trainingInstitute.deleteMany({});
    console.log("✅ Deleted all training institutes");

    await prisma.refreshToken.deleteMany({});
    console.log("✅ Deleted all refresh tokens");

    // Keep only one Super Admin, delete all others
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
    console.log("📊 Remaining records:");
    
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
    };

    console.log(JSON.stringify(counts, null, 2));

  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase();
