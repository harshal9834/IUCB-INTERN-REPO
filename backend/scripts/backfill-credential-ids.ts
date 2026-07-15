/**
 * Backfill Script: Populate NULL certificateId and registrationNumber
 * on existing Credential rows.
 *
 * Run once with:  npx tsx scripts/backfill-credential-ids.ts
 *
 * Rules:
 *  - Never overwrite an existing non-NULL value.
 *  - Derive the module code from the linked application type.
 *  - Fall back to "ORG" when no application is linked.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MODULE_PREFIX_MAP: Record<string, string> = {
  TRAINING_INSTITUTE: "INS",
  ACCREDITATION: "ORG",
  ADVISORY: "ADV",
  AUDITOR: "AUD",
};

function moduleCode(applicationType: string | null | undefined): string {
  if (!applicationType) return "ORG";
  return MODULE_PREFIX_MAP[applicationType] || "ORG";
}

function padSeq(n: number): string {
  return String(n).padStart(6, "0");
}

async function highestSeqForPrefix(
  field: "certificateId" | "registrationNumber",
  prefix: string
): Promise<number> {
  const rows = await prisma.credential.findMany({
    where: { [field]: { startsWith: prefix, not: null } },
    select: { [field]: true },
  });

  let max = 0;
  for (const row of rows) {
    const val = row[field] as string | null;
    if (!val) continue;
    const m = val.match(/(\d{6})$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max;
}

async function main() {
  // Fetch all credentials that are missing at least one ID
  const nullRows = await prisma.credential.findMany({
    where: {
      OR: [
        { certificateId: null },
        { registrationNumber: null },
      ],
    },
    include: {
      application: { select: { applicationType: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (nullRows.length === 0) {
    console.log("✅  No NULL rows found. Nothing to backfill.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${nullRows.length} credential(s) with NULL ids. Starting backfill…\n`);

  // Group rows by module so we can keep per-module counters
  // without re-querying the DB on every iteration
  const seqCache: Record<string, number> = {};

  for (const row of nullRows) {
    const appType = row.application?.applicationType ?? null;
    const mc = moduleCode(appType);

    const certPrefix = `IUCB-${mc}-`;
    const regPrefix  = `IUCB-REG-${mc}-`;

    // Lazy-initialise the counter from the DB the first time we see a module
    if (seqCache[`cert:${mc}`] === undefined) {
      seqCache[`cert:${mc}`] = await highestSeqForPrefix("certificateId", certPrefix);
    }
    if (seqCache[`reg:${mc}`] === undefined) {
      seqCache[`reg:${mc}`] = await highestSeqForPrefix("registrationNumber", regPrefix);
    }

    const updateData: {
      certificateId?: string;
      registrationNumber?: string;
    } = {};

    // Only generate if currently NULL — never overwrite
    if (row.certificateId === null) {
      seqCache[`cert:${mc}`] += 1;
      updateData.certificateId = `${certPrefix}${padSeq(seqCache[`cert:${mc}`])}`;
    }
    if (row.registrationNumber === null) {
      seqCache[`reg:${mc}`] += 1;
      updateData.registrationNumber = `${regPrefix}${padSeq(seqCache[`reg:${mc}`])}`;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.credential.update({
        where: { id: row.id },
        data: updateData,
      });
      console.log(
        `  ✔ Credential ${row.credentialId} → certId: ${updateData.certificateId ?? "(kept)"}, regNum: ${updateData.registrationNumber ?? "(kept)"}`
      );
    }
  }

  console.log("\n✅  Backfill complete.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Backfill failed:", err);
  process.exit(1);
});
