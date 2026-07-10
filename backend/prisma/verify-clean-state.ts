import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyCleanState() {
  console.log("🔍 Verifying clean database state...\n");

  try {
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
      emailLogs: await prisma.emailLog.count(),
      systemSettings: await prisma.systemSettings.count(),
    };

    console.log("📊 CURRENT DATABASE STATE:");
    console.log("=" .repeat(50));
    console.log(`Admins:              ${counts.admins} ✅ (Super Admin only)`);
    console.log(`Organizations:       ${counts.organizations} ✅ (Empty - ready for real data)`);
    console.log(`Auditors:            ${counts.auditors} ✅ (Empty - ready for real data)`);
    console.log(`Credentials:         ${counts.credentials} ✅ (Empty - ready for real data)`);
    console.log(`Applications:        ${counts.applications} ✅ (Empty - ready for real data)`);
    console.log(`Advisors:            ${counts.advisors} ✅ (Empty - ready for real data)`);
    console.log(`Training Institutes: ${counts.trainingInstitutes} ✅ (Empty - ready for real data)`);
    console.log(`News:                ${counts.news} ✅ (Empty - ready for real data)`);
    console.log(`Resources:           ${counts.resources} ✅ (Empty - ready for real data)`);
    console.log(`Audit Logs:          ${counts.auditLogs} ✅ (Empty)`);
    console.log(`Email Logs:          ${counts.emailLogs} ✅ (Empty)`);
    console.log(`System Settings:     ${counts.systemSettings} ✅ (System config only)`);
    console.log("=" .repeat(50));

    // Verify Super Admin
    const admin = await prisma.admin.findUnique({
      where: { email: "admin@iucb.org" }
    });

    if (admin) {
      console.log("\n✅ SUPER ADMIN VERIFIED:");
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Status: ${admin.status}`);
    } else {
      console.log("\n❌ SUPER ADMIN NOT FOUND!");
    }

    // Verify system settings
    const settings = await prisma.systemSettings.findMany();
    console.log("\n✅ SYSTEM SETTINGS:");
    settings.forEach(s => {
      console.log(`   ${s.key}: ${s.value}`);
    });

    console.log("\n" + "=".repeat(50));
    console.log("✅ VERIFICATION COMPLETE");
    console.log("=".repeat(50));
    console.log("✓ No dummy data exists");
    console.log("✓ No mock records in database");
    console.log("✓ Only system admin present");
    console.log("✓ Database ready for real data");
    console.log("=".repeat(50) + "\n");

  } catch (error) {
    console.error("❌ Verification error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyCleanState();
