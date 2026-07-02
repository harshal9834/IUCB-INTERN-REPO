import { PrismaClient, AdminRole, OrganizationStatus, AuditorTier, CredentialStatus, ApplicationStatus, AdvisorStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Clean existing records (except admins to make idempotent)
  await prisma.systemSettings.deleteMany({});
  await prisma.emailLog.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.news.deleteMany({});
  await prisma.advisor.deleteMany({});
  await prisma.advisoryApplication.deleteMany({});
  await prisma.credential.deleteMany({});
  await prisma.auditor.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  // Don't delete admins - we'll upsert them instead for idempotency

  // 2. Upsert Default Development Admin (Idempotent)
  const defaultPassword = "Admin@123";
  const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10);

  const defaultAdmin = await prisma.admin.upsert({
    where: { email: "admin@iucb.local" },
    update: {
      fullName: "Super Admin",
      password: hashedDefaultPassword,
      role: AdminRole.SUPER_ADMIN,
      status: "ACTIVE",
    },
    create: {
      fullName: "Super Admin",
      email: "admin@iucb.local",
      password: hashedDefaultPassword,
      role: AdminRole.SUPER_ADMIN,
      status: "ACTIVE",
    },
  });
  console.log("✅ Default Admin ensured:", defaultAdmin.email);

  // 2b. Upsert Super Admin (Production-style)
  const superAdminPassword = "SuperAdminPass123!";
  const hashedSuperAdminPassword = await bcrypt.hash(superAdminPassword, 10);

  const superAdmin = await prisma.admin.upsert({
    where: { email: "superadmin@iucb.org" },
    update: {
      fullName: "IUCB Super Administrator",
      password: hashedSuperAdminPassword,
      role: AdminRole.SUPER_ADMIN,
      status: "ACTIVE",
    },
    create: {
      fullName: "IUCB Super Administrator",
      email: "superadmin@iucb.org",
      password: hashedSuperAdminPassword,
      role: AdminRole.SUPER_ADMIN,
      status: "ACTIVE",
    },
  });
  console.log("✅ Super Admin ensured:", superAdmin.email);

  // 2c. Upsert Normal Admin
  const normalAdmin = await prisma.admin.upsert({
    where: { email: "admin@iucb.org" },
    update: {
      fullName: "Accreditation Officer",
      password: hashedSuperAdminPassword,
      role: AdminRole.ADMIN,
      status: "ACTIVE",
    },
    create: {
      fullName: "Accreditation Officer",
      email: "admin@iucb.org",
      password: hashedSuperAdminPassword,
      role: AdminRole.ADMIN,
      status: "ACTIVE",
    },
  });
  console.log("✅ Normal Admin ensured:", normalAdmin.email);

  // 3. Seed 5 Organizations
  const orgNames = [
    { name: "Global Standards Registrar", country: "United States", code: "GSR-1001" },
    { name: "EuroCert Compliance BV", country: "Netherlands", code: "ECC-2032" },
    { name: "APAC Quality Assurance Ltd", country: "Singapore", code: "AQA-4091" },
    { name: "Americas ISO Registrar", country: "Canada", code: "AIR-8821" },
    { name: "CyberAccredit Audit Corp", country: "United Kingdom", code: "CAC-7701" },
  ];

  const organizations = [];
  for (let i = 0; i < orgNames.length; i++) {
    const org = await prisma.organization.create({
      data: {
        organizationName: orgNames[i].name,
        registrationNumber: orgNames[i].code,
        country: orgNames[i].country,
        address: `${100 + i * 25} Business Boulevard, Suite ${10 + i}, ${orgNames[i].country}`,
        email: `info@${orgNames[i].name.toLowerCase().replace(/ /g, "")}.com`,
        phone: `+1-555-010${i}`,
        website: `https://www.${orgNames[i].name.toLowerCase().replace(/ /g, "")}.com`,
        accreditationStatus: OrganizationStatus.ACTIVE,
        accreditationDate: new Date("2025-01-15"),
        expiryDate: new Date("2030-01-15"),
      },
    });
    organizations.push(org);
  }
  console.log("✅ Seeded 5 Organizations");

  // 4. Seed 10 Auditors (2 per Organization)
  const auditors = [];
  const specializedTiers = [AuditorTier.ASSOCIATE, AuditorTier.SENIOR, AuditorTier.LEAD];
  const specializations = ["ISO/IEC 27001", "ISO 9001", "ISO 14001", "ISO 27701", "SOC 2 Type II"];

  for (let i = 0; i < 10; i++) {
    const orgIndex = Math.floor(i / 2);
    const auditor = await prisma.auditor.create({
      data: {
        fullName: `Auditor Candidate ${i + 1}`,
        email: `auditor${i + 1}@${organizations[orgIndex].organizationName.toLowerCase().replace(/ /g, "")}.com`,
        phone: `+1-555-020${i}`,
        organizationId: organizations[orgIndex].id,
        tier: specializedTiers[i % 3],
        specialization: specializations[i % 5],
        experienceYears: 4 + (i * 2),
        status: "ACTIVE",
      },
    });
    auditors.push(auditor);
  }
  console.log("✅ Seeded 10 Auditors");

  // 5. Seed 20 Credentials (4 per Organization)
  const standards = ["ISO/IEC 27001:2022", "ISO 9001:2015", "ISO 14001:2015", "ISO 22301:2019", "ISO/IEC 27701:2019"];
  for (let i = 0; i < 20; i++) {
    const orgIndex = Math.floor(i / 4);
    const auditorIndex = (orgIndex * 2) + (i % 2); // Select one of the auditors mapped to this org

    await prisma.credential.create({
      data: {
        credentialNumber: `IUCB-ISO-${100000 + i}`,
        standard: standards[i % standards.length],
        issueDate: new Date("2026-02-10"),
        expiryDate: new Date("2029-02-10"),
        status: CredentialStatus.VALID,
        organizationId: organizations[orgIndex].id,
        auditorId: auditors[auditorIndex].id,
        verificationUrl: `https://verify.iucb.org/credentials/IUCB-ISO-${100000 + i}`,
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://verify.iucb.org/credentials/IUCB-ISO-${100000 + i}`,
      },
    });
  }
  console.log("✅ Seeded 20 Credentials");

  // 6. Seed 5 Advisory Applications (3 Approved, 1 Pending, 1 Rejected)
  const appStatusOptions = [
    ApplicationStatus.APPROVED,
    ApplicationStatus.APPROVED,
    ApplicationStatus.APPROVED,
    ApplicationStatus.PENDING,
    ApplicationStatus.REJECTED,
  ];

  const applications = [];
  for (let i = 0; i < 5; i++) {
    const app = await prisma.advisoryApplication.create({
      data: {
        fullName: `Advisor Candidate ${i + 1}`,
        email: `advisor.candidate${i + 1}@gmail.com`,
        linkedinUrl: `https://linkedin.com/in/advisor-candidate-${i + 1}`,
        company: i % 2 === 0 ? "CyberSec Global Inc" : "Infra Standards Consulting",
        designation: i % 2 === 0 ? "Chief Information Security Officer" : "Principal ISO Lead Consultant",
        expertiseArea: i % 2 === 0 ? "Cybersecurity & Cryptography" : "Quality Management Governance",
        experienceYears: 10 + i * 3,
        statementOfMerit: "I want to help govern global standards and accreditation parameters within IUCB guidelines.",
        resumeUrl: `https://iucb.org/resumes/candidate-${i + 1}.pdf`,
        applicationStatus: appStatusOptions[i],
        reviewedById: appStatusOptions[i] !== ApplicationStatus.PENDING ? superAdmin.id : null,
        reviewedAt: appStatusOptions[i] !== ApplicationStatus.PENDING ? new Date() : null,
      },
    });
    applications.push(app);
  }
  console.log("✅ Seeded 5 Advisory Applications");

  // 7. Seed 3 Advisors (Linking to the 3 Approved Advisory Applications)
  for (let i = 0; i < 3; i++) {
    await prisma.advisor.create({
      data: {
        advisoryApplicationId: applications[i].id,
        fullName: applications[i].fullName,
        linkedinUrl: applications[i].linkedinUrl,
        organization: applications[i].company,
        designation: applications[i].designation,
        expertiseArea: applications[i].expertiseArea,
        experienceYears: applications[i].experienceYears,
        bio: `Experienced advisory board member specializing in ${applications[i].expertiseArea} with over ${applications[i].experienceYears} years in senior engineering roles.`,
        status: AdvisorStatus.ACTIVE,
      },
    });
  }
  console.log("✅ Seeded 3 Advisors");

  // 8. Seed 5 News articles
  for (let i = 0; i < 5; i++) {
    await prisma.news.create({
      data: {
        title: `IUCB Global Accreditation Update — Volume ${i + 1}`,
        slug: `iucb-global-accreditation-update-vol-${i + 1}`,
        content: `<p>This is standard global news article content for volume ${i + 1} regarding our international expansion and auditing certifications policies.</p>`,
        featuredImage: `https://iucb.org/images/news-update-${i + 1}.jpg`,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }
  console.log("✅ Seeded 5 News Articles");

  // 9. Seed 5 Resources
  const categories = ["ISO Standards", "Accreditation Policies", "Auditor Toolkits"];
  for (let i = 0; i < 5; i++) {
    await prisma.resource.create({
      data: {
        title: `IUCB Standard Guidelines Doc ${i + 1}`,
        description: `Reference guide ${i + 1} regarding accreditation standards compliance parameters and criteria.`,
        fileUrl: `https://iucb.org/files/guidelines-reference-${i + 1}.pdf`,
        category: categories[i % categories.length],
      },
    });
  }
  console.log("✅ Seeded 5 Resources");

  // 10. Seed System Settings
  await prisma.systemSettings.createMany({
    data: [
      { key: "maintenance_mode", value: "false" },
      { key: "allow_public_advisor_applications", value: "true" },
    ],
  });
  console.log("✅ Seeded System Settings");

  console.log("\n===========================================");
  console.log("✅ Seeding completed successfully!");
  console.log("===========================================");
  console.log("\n📝 DEFAULT ADMIN CREDENTIALS (DEVELOPMENT):");
  console.log("   Email: admin@iucb.local");
  console.log("   Password: Admin@123");
  console.log("===========================================\n");
}

main()
  .catch((e) => {
    console.error("Error in seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
