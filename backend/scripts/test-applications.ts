import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runApplicationTests() {
  console.log("=================================================");
  console.log("STARTING FULL APPLICATION WORKFLOW & SCHEMA TESTS");
  console.log("=================================================");

  const timestamp = Date.now();

  try {
    // 1. TEST ACCREDITATION APPLICATION
    console.log("\n[TEST 1] Creating Accreditation Application...");
    const accApp = await prisma.application.create({
      data: {
        applicationType: "ACCREDITATION",
        applicationNumber: `TEST-ACC-${timestamp}`,
        fullName: "Test Acc Contact",
        email: `acc_test_${timestamp}@example.com`,
        phone: "+1-555-0100",
        company: "Test Accreditation Org",
        organizationType: "Certification Body",
        registrationNumber: `REG-ACC-${timestamp}`,
        country: "United States",
        countryCode: "US",
        phoneCode: "+1",
        state: "California",
        city: "San Francisco",
        postalCode: "94105",
        addressLine1: "100 Market St",
        addressLine2: "Suite 400",
        address: "100 Market St, Suite 400, San Francisco, CA 94105",
        website: "https://example.com",
        appliedStandard: "ISO 9001",
        message: "Test accreditation application",
        applicationStatus: "PENDING",
      },
    });
    console.log("✔ Accreditation Application created with ID:", accApp.id);
    console.log("  Location stored:", {
      country: accApp.country,
      countryCode: accApp.countryCode,
      phoneCode: accApp.phoneCode,
      state: accApp.state,
      city: accApp.city,
      postalCode: accApp.postalCode,
    });

    // 2. TEST AUDITOR APPLICATION
    console.log("\n[TEST 2] Creating Auditor Application...");
    const audApp = await prisma.application.create({
      data: {
        applicationType: "AUDITOR",
        applicationNumber: `TEST-AUD-${timestamp}`,
        fullName: "Test Auditor",
        email: `aud_test_${timestamp}@example.com`,
        phone: "+1-555-0200",
        company: "Audit Solutions Inc",
        designation: "Lead Auditor",
        country: "Canada",
        countryCode: "CA",
        phoneCode: "+1",
        state: "Ontario",
        city: "Toronto",
        postalCode: "M5V 2T6",
        addressLine1: "200 Bay St",
        addressLine2: "Floor 12",
        address: "200 Bay St, Floor 12, Toronto, ON",
        appliedStandard: "ISO 27001",
        experienceYears: 7,
        statementOfMerit: "10 years auditing experience",
        linkedinUrl: "https://linkedin.com/in/testauditor",
        applicationStatus: "PENDING",
      },
    });
    console.log("✔ Auditor Application created with ID:", audApp.id);
    console.log("  Location stored:", {
      country: audApp.country,
      countryCode: audApp.countryCode,
      state: audApp.state,
      city: audApp.city,
    });

    // 3. TEST TRAINING INSTITUTE APPLICATION
    console.log("\n[TEST 3] Creating Training Institute Application...");
    const trnApp = await prisma.application.create({
      data: {
        applicationType: "TRAINING_INSTITUTE",
        applicationNumber: `TEST-TRN-${timestamp}`,
        fullName: "Test Institute Director",
        email: `trn_test_${timestamp}@example.com`,
        phone: "+44-20-7946-0912",
        company: "Global Training Academy",
        organizationType: "Educational Institute",
        registrationNumber: `REG-TRN-${timestamp}`,
        country: "United Kingdom",
        countryCode: "GB",
        phoneCode: "+44",
        state: "Greater London",
        city: "London",
        postalCode: "EC1A 1BB",
        addressLine1: "10 London Wall",
        addressLine2: "Unit 3B",
        address: "10 London Wall, London, UK",
        website: "https://trainingacademy.example.com",
        appliedStandard: "ISO 14001",
        applicationStatus: "PENDING",
      },
    });
    console.log("✔ Training Institute Application created with ID:", trnApp.id);
    console.log("  Location stored:", {
      country: trnApp.country,
      countryCode: trnApp.countryCode,
      state: trnApp.state,
      city: trnApp.city,
    });

    // 4. TEST ADVISORY BOARD APPLICATION
    console.log("\n[TEST 4] Creating Advisory Board Application...");
    const advApp = await prisma.application.create({
      data: {
        applicationType: "ADVISORY",
        applicationNumber: `TEST-ADV-${timestamp}`,
        fullName: "Test Advisor",
        email: `adv_test_${timestamp}@example.com`,
        phone: "+61-2-9374-4000",
        country: "Australia",
        countryCode: "AU",
        phoneCode: "+61",
        state: "New South Wales",
        city: "Sydney",
        postalCode: "2000",
        addressLine1: "1 Martin Pl",
        addressLine2: null,
        address: "1 Martin Pl, Sydney NSW 2000",
        linkedinUrl: "https://linkedin.com/in/testadvisor",
        company: "Apex Advisory Group",
        designation: "Managing Director",
        expertiseArea: "Quality Management Systems",
        experienceYears: 15,
        statementOfMerit: "Senior Quality Systems Specialist",
        resumeUrl: "https://example.com/resume.pdf",
        applicationStatus: "PENDING",
      },
    });
    console.log("✔ Advisory Application created with ID:", advApp.id);
    console.log("  Location stored:", {
      country: advApp.country,
      countryCode: advApp.countryCode,
      state: advApp.state,
      city: advApp.city,
    });

    // 5. TEST PRISMA FIND FIRST & QUERY OPERATIONS
    console.log("\n[TEST 5] Executing prisma.application.findFirst() & findMany() queries...");
    const foundAdvisory = await prisma.application.findFirst({
      where: {
        email: advApp.email,
        applicationType: "ADVISORY",
        deletedAt: null,
      },
    });
    if (!foundAdvisory || foundAdvisory.countryCode !== "AU") {
      throw new Error("Failed to find advisory application or countryCode mismatch!");
    }
    console.log("✔ prisma.application.findFirst() executed successfully!");

    const foundCount = await prisma.application.count({
      where: {
        applicationNumber: { startsWith: `TEST-` },
      },
    });
    console.log(`✔ Found ${foundCount} test applications in database query.`);

    // 6. TEST APPROVAL WORKFLOW FOR ACCREDITATION (Organization creation)
    console.log("\n[TEST 6] Testing Accreditation approval & Organization creation...");
    const accDate = new Date();
    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 5);

    const createdOrg = await prisma.organization.create({
      data: {
        organizationName: accApp.company!,
        registrationNumber: accApp.registrationNumber!,
        country: accApp.country!,
        countryCode: accApp.countryCode,
        phoneCode: accApp.phoneCode,
        state: accApp.state,
        city: accApp.city,
        postalCode: accApp.postalCode,
        addressLine1: accApp.addressLine1,
        addressLine2: accApp.addressLine2,
        address: accApp.address!,
        email: accApp.email,
        phone: accApp.phone!,
        website: accApp.website,
        accreditationStatus: "ACTIVE",
        accreditationDate: accDate,
        expiryDate: expDate,
      },
    });
    console.log("✔ Approved Organization created with ID:", createdOrg.id);
    console.log("  Organization Location stored:", {
      country: createdOrg.country,
      countryCode: createdOrg.countryCode,
      city: createdOrg.city,
    });

    // 7. TEST APPROVAL WORKFLOW FOR AUDITOR (Auditor creation)
    console.log("\n[TEST 7] Testing Auditor approval & Auditor profile creation...");
    const createdAuditor = await prisma.auditor.create({
      data: {
        fullName: audApp.fullName,
        email: audApp.email,
        phone: audApp.phone!,
        organizationId: createdOrg.id,
        tier: "ASSOCIATE",
        specialization: audApp.appliedStandard!,
        experienceYears: audApp.experienceYears!,
        status: "ACTIVE",
        country: audApp.country,
        countryCode: audApp.countryCode,
        phoneCode: audApp.phoneCode,
        state: audApp.state,
        city: audApp.city,
        postalCode: audApp.postalCode,
        addressLine1: audApp.addressLine1,
        addressLine2: audApp.addressLine2,
        address: audApp.address,
      },
    });
    console.log("✔ Approved Auditor created with ID:", createdAuditor.id);
    console.log("  Auditor Location stored:", {
      country: createdAuditor.country,
      countryCode: createdAuditor.countryCode,
      city: createdAuditor.city,
    });

    // 8. TEST APPROVAL WORKFLOW FOR TRAINING INSTITUTE
    console.log("\n[TEST 8] Testing Training Institute approval & record creation...");
    const createdTraining = await prisma.trainingInstitute.create({
      data: {
        instituteName: trnApp.company!,
        registrationNumber: trnApp.registrationNumber!,
        country: trnApp.country!,
        countryCode: trnApp.countryCode,
        phoneCode: trnApp.phoneCode,
        state: trnApp.state,
        city: trnApp.city,
        postalCode: trnApp.postalCode,
        addressLine1: trnApp.addressLine1,
        addressLine2: trnApp.addressLine2,
        address: trnApp.address!,
        email: trnApp.email,
        phone: trnApp.phone!,
        website: trnApp.website,
        status: "ACTIVE",
      },
    });
    console.log("✔ Approved Training Institute created with ID:", createdTraining.id);

    // 9. TEST APPROVAL WORKFLOW FOR ADVISORY
    console.log("\n[TEST 9] Testing Advisory approval & Advisor profile creation...");
    const createdAdvisor = await prisma.advisor.create({
      data: {
        applicationId: advApp.id,
        fullName: advApp.fullName,
        linkedinUrl: advApp.linkedinUrl,
        organization: advApp.company!,
        designation: advApp.designation!,
        expertiseArea: advApp.expertiseArea!,
        experienceYears: advApp.experienceYears!,
        status: "ACTIVE",
        country: advApp.country,
        countryCode: advApp.countryCode,
        phoneCode: advApp.phoneCode,
        state: advApp.state,
        city: advApp.city,
        postalCode: advApp.postalCode,
        addressLine1: advApp.addressLine1,
        addressLine2: advApp.addressLine2,
        address: advApp.address,
      },
    });
    console.log("✔ Approved Advisor created with ID:", createdAdvisor.id);

    // 10. CLEANUP TEST DATA
    console.log("\n[CLEANUP] Cleaning up test records...");
    await prisma.advisor.delete({ where: { id: createdAdvisor.id } });
    await prisma.auditor.delete({ where: { id: createdAuditor.id } });
    await prisma.organization.delete({ where: { id: createdOrg.id } });
    await prisma.trainingInstitute.delete({ where: { id: createdTraining.id } });
    await prisma.application.deleteMany({
      where: { id: { in: [accApp.id, audApp.id, trnApp.id, advApp.id] } },
    });
    console.log("✔ Test records cleaned up successfully.");

    console.log("\n=================================================");
    console.log("ALL TESTS PASSED SUCCESSFULLY WITH 100% SUCCESS!");
    console.log("=================================================");
  } catch (error) {
    console.error("\n❌ TEST FAILED WITH ERROR:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runApplicationTests();
