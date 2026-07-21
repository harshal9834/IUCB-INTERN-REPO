const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Get an admin token
  const admin = await prisma.admin.findFirst();
  if (!admin) return console.log("No admin");

  // Generate a JWT for this admin (assuming standard structure or we just mock the request)
  // Actually, we don't have the JWT secret.
  
  // Let's just find the application and run the transaction exactly as the controller does.
  const application = await prisma.application.findFirst({
    where: { fullName: { contains: 'Harshal' } },
  });
  console.log("App found:", application);

  try {
    const result = await prisma.$transaction(async (tx) => {
      let mappedTable = "Organization";
      const accDate = new Date();
      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + 5);

      const orgData = {
        organizationName: application.company ?? application.fullName,
        registrationNumber: application.registrationNumber ?? `AUTO-${Date.now()}`,
        country: application.country ?? "N/A",
        countryCode: application.countryCode,
        phoneCode: application.phoneCode,
        state: application.state,
        city: application.city,
        postalCode: application.postalCode,
        addressLine1: application.addressLine1,
        addressLine2: application.addressLine2,
        address: application.address ?? "N/A",
        email: application.email,
        phone: application.phone ?? "N/A",
        website: application.website ?? null,
        accreditationStatus: "ACTIVE",
        accreditationDate: accDate,
        expiryDate: expDate,
      };

      console.log("orgData:", orgData);
      const insertedRecord = await tx.organization.create({ data: orgData });

      return insertedRecord;
    });
    console.log("Success:", result);
  } catch (error) {
    console.error("Prisma error:", error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
