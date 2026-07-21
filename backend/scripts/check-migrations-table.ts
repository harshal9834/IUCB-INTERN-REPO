import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkMigrationsTable() {
  try {
    const rows: any = await prisma.$queryRawUnsafe(`
      SELECT id, migration_name, started_at, finished_at, applied_steps_count, rolled_back_at
      FROM _prisma_migrations
      ORDER BY started_at ASC;
    `);
    console.log("=== _prisma_migrations TABLE ===");
    console.table(rows);
  } catch (err) {
    console.error("Error inspecting _prisma_migrations:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrationsTable();
