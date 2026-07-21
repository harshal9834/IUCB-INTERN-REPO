const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const application = await prisma.application.findFirst({
    where: { fullName: { contains: 'Harshal' } },
  });
  console.log('Found application:', application);

  if (!application) return;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const accDate = new Date();
      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + 5);

      const orgData = {
        organizationName: application.company ?? application.fullName,
        registrationNumber: application.registrationNumber ?? \AUTO-\\,
        country: application.country ?? 'N/A',
        address: application.address ?? 'N/A',
        email: application.email,
        phone: application.phone ?? 'N/A',
        accreditationStatus: 'ACTIVE',
        accreditationDate: accDate,
        expiryDate: expDate,
      };

      console.log('Data to insert:', orgData);
      
      const insertedRecord = await tx.organization.create({ data: orgData });
      console.log('Created Organization:', insertedRecord);

      return insertedRecord;
    });
  } catch (error) {
    console.error('TRANSACTION FAILED:', error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
