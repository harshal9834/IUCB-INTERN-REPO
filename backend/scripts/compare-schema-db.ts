import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const tables: any = await prisma.$queryRawUnsafe(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  `);
  
  console.log("=== DB TABLES IN PUBLIC SCHEMA ===");
  const tableNames = tables.map((t: any) => t.table_name);
  console.log(tableNames);

  for (const tableName of tableNames) {
    const columns: any = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = '${tableName}';
    `);
    console.log(`\nTable: ${tableName} (${columns.length} columns)`);
    console.log(columns.map((c: any) => `  - ${c.column_name}`).join("\n"));
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
