/**
 * IUCB Auth Pipeline Diagnostic Script
 * Runs inside backend context — has access to Prisma + bcrypt
 */
import prisma from "./src/config/Database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const TEST_EMAIL = "admin@iucb.local";
const TEST_PASSWORD = "Admin@123";
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_jwt_signing_key_change_me_in_production";

async function diagnose() {
  console.log("\n===========================================");
  console.log("  IUCB AUTH PIPELINE DIAGNOSTIC");
  console.log("===========================================\n");

  // -------------------------------------------------------
  // STEP 1: Check DATABASE connectivity
  // -------------------------------------------------------
  console.log("STEP 1: Database connectivity...");
  try {
    await prisma.$connect();
    console.log("  ✅ Database connected OK\n");
  } catch (err: any) {
    console.error("  ❌ DB connection failed:", err.message);
    process.exit(1);
  }

  // -------------------------------------------------------
  // STEP 2: Count all admins (no filter)
  // -------------------------------------------------------
  console.log("STEP 2: Counting ALL admin records...");
  const allAdmins = await prisma.admin.findMany({
    select: { id: true, email: true, role: true, status: true, deletedAt: true, password: true }
  });
  console.log(`  Total admin rows: ${allAdmins.length}`);
  if (allAdmins.length === 0) {
    console.error("  ❌ NO ADMINS IN DATABASE — need to run seed!\n");
  } else {
    console.log("  Admin records found:");
    allAdmins.forEach(a => {
      console.log(`    - ${a.email} | role=${a.role} | status=${a.status} | deletedAt=${a.deletedAt ?? "null"} | hashLen=${a.password.length}`);
    });
    console.log();
  }

  // -------------------------------------------------------
  // STEP 3: Lookup superadmin specifically (findUnique)
  // -------------------------------------------------------
  console.log(`STEP 3: findUnique({ where: { email: "${TEST_EMAIL}" } })...`);
  const admin = await prisma.admin.findUnique({
    where: { email: TEST_EMAIL }
  });

  if (!admin) {
    console.error(`  ❌ Admin NOT FOUND for email: ${TEST_EMAIL}`);
    console.error("  → Seed has not run or email is wrong\n");
    await prisma.$disconnect();
    return;
  }
  console.log(`  ✅ Admin found: id=${admin.id}`);
  console.log(`     email:     ${admin.email}`);
  console.log(`     role:      ${admin.role}`);
  console.log(`     status:    ${admin.status}`);
  console.log(`     deletedAt: ${admin.deletedAt ?? "null"}`);
  console.log(`     hashLen:   ${admin.password.length}`);
  console.log(`     hash:      ${admin.password.substring(0, 30)}...`);
  console.log();

  // -------------------------------------------------------
  // STEP 4: Check deletedAt guard
  // -------------------------------------------------------
  console.log("STEP 4: deletedAt guard (admin.deletedAt !== null)...");
  if (admin.deletedAt !== null) {
    console.error(`  ❌ BLOCKED — admin is soft-deleted (deletedAt=${admin.deletedAt})`);
  } else {
    console.log("  ✅ Not soft-deleted\n");
  }

  // -------------------------------------------------------
  // STEP 5: Check status guard
  // -------------------------------------------------------
  console.log("STEP 5: status guard (admin.status !== 'ACTIVE')...");
  if (admin.status !== "ACTIVE") {
    console.error(`  ❌ BLOCKED — status is "${admin.status}", expected "ACTIVE"`);
  } else {
    console.log("  ✅ Status is ACTIVE\n");
  }

  // -------------------------------------------------------
  // STEP 6: bcrypt.compare()
  // -------------------------------------------------------
  console.log(`STEP 6: bcrypt.compare("${TEST_PASSWORD}", storedHash)...`);
  const startBcrypt = Date.now();
  const isMatch = await bcrypt.compare(TEST_PASSWORD, admin.password);
  const bcryptMs = Date.now() - startBcrypt;
  if (!isMatch) {
    console.error(`  ❌ BCRYPT MISMATCH — password does not match hash (took ${bcryptMs}ms)`);
    console.error("  → Hash in DB may have been created with a different password or rounds");
    
    // Try to verify hash format
    const hashParts = admin.password.split("$");
    console.log(`  → Hash format: $${hashParts[1]}$${hashParts[2]} (algorithm $${hashParts[1]}, rounds ${hashParts[2]})`);
    
    // Generate a fresh hash and show what it looks like
    console.log("\n  Generating a FRESH hash of 'SuperAdminPass123!' for comparison:");
    const freshHash = await bcrypt.hash(TEST_PASSWORD, 10);
    console.log(`  freshHash: ${freshHash}`);
    const recheckMatch = await bcrypt.compare(TEST_PASSWORD, freshHash);
    console.log(`  Fresh hash self-verify: ${recheckMatch ? "✅ PASS" : "❌ FAIL"}`);
    console.log();
  } else {
    console.log(`  ✅ bcrypt.compare PASSED (took ${bcryptMs}ms)\n`);
  }

  // -------------------------------------------------------
  // STEP 7: JWT generation
  // -------------------------------------------------------
  console.log("STEP 7: JWT generation...");
  try {
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: "15m" }
    );
    console.log(`  ✅ Access token generated (len=${token.length})`);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log(`  ✅ Token verified: { id: ${decoded.id}, email: ${decoded.email}, role: ${decoded.role} }\n`);
  } catch (err: any) {
    console.error(`  ❌ JWT failed: ${err.message}\n`);
  }

  // -------------------------------------------------------
  // STEP 8: Zod validation of sample payload
  // -------------------------------------------------------
  console.log("STEP 8: Zod loginSchema validation...");
  const { loginSchema } = await import("./src/validators/auth.validators.js");
  const payload = { email: TEST_EMAIL, password: TEST_PASSWORD };
  const result = loginSchema.safeParse(payload);
  if (!result.success) {
    console.error("  ❌ Zod validation FAILED:", result.error.format());
  } else {
    console.log(`  ✅ Zod validates { email: "${result.data.email}", password: "${result.data.password}" }\n`);
  }

  // -------------------------------------------------------
  // STEP 9: Full summary
  // -------------------------------------------------------
  console.log("===========================================");
  console.log("  SUMMARY");
  console.log("===========================================");
  console.log(`  Admin found:    ${!!admin}`);
  console.log(`  Not deleted:    ${admin.deletedAt === null}`);
  console.log(`  Status ACTIVE:  ${admin.status === "ACTIVE"}`);
  console.log(`  Password match: ${isMatch}`);
  console.log("===========================================\n");

  await prisma.$disconnect();
}

diagnose().catch(async (err) => {
  console.error("Diagnostic error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
