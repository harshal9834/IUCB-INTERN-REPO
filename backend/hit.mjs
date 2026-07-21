import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const application = await prisma.application.findFirst({
    where: { applicationType: 'ACCREDITATION', applicationStatus: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  });
  console.log('App found:', application?.id);

  if (!application) return;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let mappedTable = 'Organization';
      const accDate = new Date();
      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + 5);

      const orgData = {
        organizationName: application.company ?? application.fullName,
        registrationNumber: application.registrationNumber ?? `AUTO-${Date.now()}`,
        country: application.country ?? 'N/A',
        countryCode: application.countryCode,
        phoneCode: application.phoneCode,
        state: application.state,
        city: application.city,
        postalCode: application.postalCode,
        addressLine1: application.addressLine1,
        addressLine2: application.addressLine2,
        address: application.address ?? 'N/A',
        email: application.email,
        phone: application.phone ?? 'N/A',
        website: application.website ?? null,
        accreditationStatus: 'ACTIVE',
        accreditationDate: accDate,
        expiryDate: expDate,
      };
      
      const insertedRecord = await tx.organization.create({ data: orgData });

      const updatedApplication = await tx.application.update({
        where: { id: application.id },
        data: {
          applicationStatus: "APPROVED",
          internalNotes: application.internalNotes,
          reviewedAt: new Date(),
        },
      });

      const admin = await tx.admin.findFirst();
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          entityType: "APPLICATION",
          entityId: application.id,
          action: "APPROVE",
          oldData: { applicationStatus: "PENDING" },
          newData: { applicationStatus: "APPROVED", mappedTable, insertedId: insertedRecord.id },
        },
      });

      return insertedRecord;
    });
    console.log('Success:', result);
  } catch (error) {
    console.error('Prisma error:', error);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
