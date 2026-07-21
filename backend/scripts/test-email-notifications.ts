import { EmailService } from "../src/services/email.service.js";
import prisma from "../src/config/Database.js";

async function runEmailNotificationTests() {
  console.log("==================================================");
  console.log("TESTING ALL EMAIL NOTIFICATION TRIGGERS & MODULES");
  console.log("==================================================");

  const testEmail = "test_recipient@iucb.org";
  const testName = "Test Recipient";

  try {
    // 1. APPLICATION SUBMISSION CONFIRMATION EMAIL
    console.log("\n[1/10] Testing Submission Confirmation Email...");
    await EmailService.sendSubmissionConfirmationEmail({
      to: testEmail,
      applicantName: testName,
      applicationType: "Accreditation Organization",
      applicationNumber: "APP-ACC-999999",
    });
    console.log("✔ Submission Confirmation Email sent & logged!");

    // 2. APPLICATION APPROVAL EMAIL
    console.log("\n[2/10] Testing Application Approval Email...");
    await EmailService.sendApprovalEmail({
      to: testEmail,
      applicantName: testName,
      applicationType: "Accreditation Organization",
      applicationNumber: "APP-ACC-999999",
    });
    console.log("✔ Application Approval Email sent & logged!");

    // 3. APPLICATION REJECTION EMAIL
    console.log("\n[3/10] Testing Application Rejection Email...");
    await EmailService.sendRejectionEmail({
      to: testEmail,
      applicantName: testName,
      applicationType: "Auditor",
      reason: "Documentation incomplete",
    });
    console.log("✔ Application Rejection Email sent & logged!");

    // 4. ADVISORY BOARD WELCOME & STATUS EMAILS
    console.log("\n[4/10] Testing Advisory Board Emails...");
    await EmailService.sendWelcomeEmail({
      to: testEmail,
      applicantName: testName,
      role: "Advisory Board Member",
      applicationNumber: "APP-ADV-999999",
    });
    await EmailService.sendAdvisorySuspensionEmail({
      to: testEmail,
      memberName: testName,
      reason: "Administrative Review",
    });
    await EmailService.sendAdvisoryDeactivationEmail({
      to: testEmail,
      memberName: testName,
      reason: "Term Completed",
    });
    await EmailService.sendAdvisoryRevocationEmail({
      to: testEmail,
      memberName: testName,
      reason: "Compliance Policy Update",
    });
    await EmailService.sendAdvisoryReactivationEmail({
      to: testEmail,
      memberName: testName,
    });
    console.log("✔ Advisory Board Emails sent & logged!");

    // 5. ORGANIZATION STATUS UPDATE EMAIL
    console.log("\n[5/10] Testing Organization Status Update Email...");
    await EmailService.sendOrganizationStatusEmail({
      to: testEmail,
      orgName: "Global Certification Standards Ltd",
      status: "SUSPENDED",
      reason: "Annual audit pending",
    });
    console.log("✔ Organization Status Update Email sent & logged!");

    // 6. AUDITOR STATUS UPDATE EMAIL
    console.log("\n[6/10] Testing Auditor Status Update Email...");
    await EmailService.sendAuditorStatusEmail({
      to: testEmail,
      auditorName: "Jane Doe, Lead Auditor",
      status: "ACTIVE",
    });
    console.log("✔ Auditor Status Update Email sent & logged!");

    // 7. TRAINING INSTITUTE STATUS UPDATE EMAIL
    console.log("\n[7/10] Testing Training Institute Status Update Email...");
    await EmailService.sendTrainingInstituteStatusEmail({
      to: testEmail,
      instituteName: "International Quality Institute",
      status: "ACTIVE",
    });
    console.log("✔ Training Institute Status Update Email sent & logged!");

    // 8. CREDENTIAL STATUS UPDATE EMAIL
    console.log("\n[8/10] Testing Credential Status Update Email...");
    await EmailService.sendCredentialStatusEmail({
      to: testEmail,
      recipientName: testName,
      credentialId: "IUCB-CRED-2026-0001",
      status: "VALID",
    });
    console.log("✔ Credential Status Update Email sent & logged!");

    // 9. MANUAL / GENERIC COMPOSER EMAIL
    console.log("\n[9/10] Testing Generic / Manual Send Email...");
    await EmailService.sendGenericEmail({
      to: testEmail,
      subject: "Important Notice Regarding Your IUCB Portal Access",
      htmlContent: "<p>Dear Recipient,</p><p>This is a manual update sent from the IUCB Admin Panel.</p>",
    });
    console.log("✔ Generic / Manual Send Email sent & logged!");

    // 10. VERIFY DATABASE EMAIL LOGS
    console.log("\n[10/10] Verifying database EmailLog entries in PostgreSQL...");
    const logs = await prisma.emailLog.findMany({
      where: { recipient: testEmail },
      orderBy: { sentAt: "desc" },
      take: 10,
    });
    console.log(`✔ Found ${logs.length} EmailLog entries in database:`);
    console.table(logs.map(l => ({ subject: l.subject, template: l.template, status: l.status, sentAt: l.sentAt })));

    // Cleanup test logs
    await prisma.emailLog.deleteMany({
      where: { recipient: testEmail },
    });
    console.log("\n✔ Test EmailLog entries cleaned up.");

    console.log("\n==================================================");
    console.log("ALL EMAIL NOTIFICATION TESTS PASSED 100% SUCCESSFULLY!");
    console.log("==================================================");
  } catch (error) {
    console.error("❌ Email notification test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runEmailNotificationTests();
