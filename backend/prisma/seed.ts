import { PrismaClient, AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...\n");

  // ============================================================
  // SYSTEM ADMIN ONLY - No Demo Data
  // ============================================================
  
  const defaultPassword = "Admin@2026";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: "admin@iucb.org" },
    update: {
      fullName: "IUCB Administrator",
      password: hashedPassword,
      role: AdminRole.SUPER_ADMIN,
      status: "ACTIVE",
    },
    create: {
      fullName: "IUCB Administrator",
      email: "admin@iucb.org",
      password: hashedPassword,
      role: AdminRole.SUPER_ADMIN,
      status: "ACTIVE",
    },
  });
  
  console.log("✅ System Admin ensured:", admin.email);

  // ============================================================
  // SYSTEM SETTINGS (Required for application functionality)
  // ============================================================
  
  await prisma.systemSettings.deleteMany({});
  
  await prisma.systemSettings.createMany({
    data: [
      { key: "maintenance_mode", value: "false" },
      { key: "allow_public_advisor_applications", value: "true" },
    ],
  });
  
  console.log("✅ System settings configured");

  console.log("\n===========================================");
  console.log("✅ Seeding completed successfully!");
  console.log("===========================================");
  console.log("\n📝 SYSTEM ADMIN CREDENTIALS:");
  console.log("   Email: admin@iucb.org");
  console.log("   Password: Admin@2026");
  console.log("\n⚠️  NO DEMO DATA - All records must be created through the application");
  console.log("===========================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Error in seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
