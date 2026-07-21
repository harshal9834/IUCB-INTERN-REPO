import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkSchema() {
  try {
    const tables = [
      'AdvisoryApplication',
      'Admin',
      'Organization',
      'Auditor',
      'Credential',
      'Advisor',
      'TrainingInstitute'
    ];

    for (const table of tables) {
      const columns: any = await prisma.$queryRawUnsafe(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '${table}'
        ORDER BY ordinal_position;
      `);
      console.log(`=== TABLE: ${table} (${columns.length} columns) ===`);
      console.log(columns.map((c: any) => `${c.column_name} (${c.data_type}, nullable: ${c.is_nullable})`).join('\n'));
      console.log('\n');
    }
  } catch (err) {
    console.error("Error inspecting DB schema:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
