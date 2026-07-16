import { Request, Response } from "express";
import prisma from "../config/Database.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { EmailService } from "../services/email.service.js";
import PDFDocument from "pdfkit";
import * as fs from "fs";
import * as path from "path";
import { IdGeneratorService } from "../services/id-generator.service.js";
import { certificateGeneratorService } from "../services/bulk-email/certificate-generator.service.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_STANDARD: Record<string, string> = {
  ACCREDITATION:     "ISO/IEC 17021-1:2015",
  AUDITOR:           "ISO/IEC 17024:2012",
  TRAINING_INSTITUTE:"ISO 9001:2015",
  ADVISORY:          "IUCB Advisory Board",
};

function getStorageDir(): string {
  const dir = path.join(process.cwd(), "storage", "certificates");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function buildCertificatePDF(
  orgName: string,
  credentialId: string,
  standard: string,
  issueDate: Date,
  expiryDate: Date,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 50 });
    const buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const W = doc.page.width;

    // Outer border
    doc.rect(20, 20, W - 40, doc.page.height - 40).lineWidth(3).stroke("#0F2942");
    doc.rect(26, 26, W - 52, doc.page.height - 52).lineWidth(1).stroke("#10b981");

    // Header
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#10b981").text("IUCB — INTERNATIONAL UNION OF CERTIFICATION BODIES", 0, 60, { align: "center" });
    doc.font("Helvetica-Bold").fontSize(32).fillColor("#0F2942").text("CERTIFICATE OF ACCREDITATION", 0, 90, { align: "center" });
    doc.moveTo(100, 140).lineTo(W - 100, 140).lineWidth(1).stroke("#10b981");

    doc.font("Helvetica").fontSize(14).fillColor("#555555").text("This is to certify that", 0, 160, { align: "center" });
    doc.font("Helvetica-Bold").fontSize(26).fillColor("#10b981").text(orgName, 0, 190, { align: "center" });
    doc.font("Helvetica").fontSize(13).fillColor("#555555").text("has been assessed and found to conform to the requirements of", 0, 240, { align: "center" });
    doc.font("Helvetica-Bold").fontSize(20).fillColor("#0F2942").text(standard, 0, 270, { align: "center" });

    // Detail box
    const boxY = 320;
    doc.rect(80, boxY, W - 160, 70).lineWidth(1).stroke("#dddddd");
    doc.font("Helvetica").fontSize(11).fillColor("#333333");
    doc.text(`Credential ID: ${credentialId}`, 100, boxY + 12);
    doc.text(`Issue Date: ${issueDate.toLocaleDateString()}`, 100, boxY + 30);
    doc.text(`Expiry Date: ${expiryDate.toLocaleDateString()}`, 100, boxY + 48);
    doc.text("Status: VALID", W / 2 + 20, boxY + 12);
    doc.text("Issuing Authority: IUCB Board", W / 2 + 20, boxY + 30);

    // Signature
    const sigY = 410;
    doc.moveTo(W / 2 - 80, sigY).lineTo(W / 2 + 80, sigY).lineWidth(1).stroke("#0F2942");
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#0F2942").text("Authorized Signatory", 0, sigY + 8, { align: "center" });
    doc.font("Helvetica").fontSize(9).fillColor("#999999").text("IUCB Accreditation Authority", 0, sigY + 22, { align: "center" });

    doc.end();
  });
}

// ── Controller ───────────────────────────────────────────────────────────────

export class CredentialsController {

  // GET /api/v1/credentials/pending
  getPendingCredentials = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const applications = await prisma.application.findMany({
      where: { applicationStatus: "APPROVED", credentialGenerated: false, deletedAt: null },
      orderBy: { reviewedAt: "desc" },
      include: { reviewedBy: { select: { id: true, fullName: true } } },
    });
    res.status(200).json(new ApiResponse(200, { pending: applications }, "Pending credentials fetched successfully"));
  });

  // GET /api/v1/credentials
  getIssuedCredentials = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const credentials = await prisma.credential.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        organization: { select: { id: true, organizationName: true, country: true } },
        auditor: { select: { id: true, fullName: true, email: true } },
        application: { select: { id: true, applicationType: true, applicationNumber: true, fullName: true, company: true, email: true } },
        generatedBy: { select: { id: true, fullName: true } },
      },
    });
    res.status(200).json(new ApiResponse(200, { credentials }, "Issued credentials fetched successfully"));
  });

  // GET /api/v1/credentials/:id
  getCredentialById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const credential = await prisma.credential.findFirst({
      where: { id, deletedAt: null },
      include: {
        organization: true,
        auditor: true,
        application: true,
        generatedBy: { select: { id: true, fullName: true, email: true } },
        emailLogs: { orderBy: { sentAt: "desc" } },
      },
    });
    if (!credential) throw new ApiError(404, "Credential not found");

    res.status(200).json(new ApiResponse(200, { credential }, "Credential fetched successfully"));
  });

  // POST /api/v1/credentials/generate
  generateCredential = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.admin) throw new ApiError(401, "Not authenticated");
    const { applicationId, issueDate, expiryDate, internalNotes } = req.body;
    if (!applicationId || !issueDate || !expiryDate) throw new ApiError(400, "Missing required fields: applicationId, issueDate, expiryDate");

    const application = await prisma.application.findFirst({
      where: { id: applicationId, applicationStatus: "APPROVED", deletedAt: null },
    });
    if (!application) throw new ApiError(404, "Approved application not found");
    if (application.credentialGenerated) throw new ApiError(400, "Credential already generated for this application");

    // Auto-derive standard from application type
    const standard = TYPE_STANDARD[application.applicationType] ?? "IUCB Accreditation Standard";

    // Auto-detect linked organization
    let organizationId: string | null = null;
    if (application.applicationType === "ACCREDITATION" && application.email) {
      const org = await prisma.organization.findFirst({
        where: { email: application.email, deletedAt: null },
        orderBy: { createdAt: "desc" },
      });
      if (org) organizationId = org.id;
    }

    // Auto-detect linked auditor
    let auditorId: string | null = null;
    if (application.applicationType === "AUDITOR" && application.email) {
      const auditor = await prisma.auditor.findFirst({
        where: { email: application.email, deletedAt: null },
        orderBy: { createdAt: "desc" },
      });
      if (auditor) auditorId = auditor.id;
    }

    // Auto-detect candidateName and organizationName
    let candidateName = application.fullName || "";
    let organizationName = application.company || "";

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    
    // Generate sequential IDs
    const { credentialId, certificateId, registrationNumber } = await IdGeneratorService.generateAllIds(application.applicationType);

    const credential = await prisma.credential.create({
      data: {
        credentialId,
        certificateId,
        registrationNumber,
        candidateName,
        organizationName,
        standard,
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate),
        status: "VALID",
        organizationId,
        auditorId,
        applicationId,
        verificationUrl: `${baseUrl}/verify?credential=${credentialId}`,
      },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        credentialGenerated: true,
        internalNotes: internalNotes ? `${application.internalNotes || ""}\n\n[Credential Notes]: ${internalNotes}` : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        entityType: "CREDENTIAL",
        entityId: credential.id,
        action: "GENERATE",
        newData: { credentialId, standard, applicationType: application.applicationType },
        ipAddress: req.ip ?? null,
        userAgent: typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : undefined,
      },
    });


    res.status(201).json(new ApiResponse(201, { credential }, "Credential generated successfully"));
  });

  // POST /api/v1/credentials/:id/certificate  — generate PDF and store locally
  generateCertificate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.admin) throw new ApiError(401, "Not authenticated");
    const id = String(req.params.id);

    const credential = await prisma.credential.findFirst({
      where: { id, deletedAt: null },
      include: { organization: true, application: true },
    });
    if (!credential) throw new ApiError(404, "Credential not found");
    if (credential.certificateGenerated) throw new ApiError(400, "Certificate already generated");

    const orgName = credential.organization?.organizationName
      || credential.application?.company
      || credential.application?.fullName
      || "Unknown Entity";

    const certType = credential.application?.applicationType || "GENERAL";
    const template = await prisma.certificateTemplate.findFirst({
      where: { detectedType: certType, status: 'ACTIVE' }
    });

    if (!template) {
      throw new ApiError(400, `No active Certificate Template found for type: ${certType}`);
    }

    const htmlContent = await fs.promises.readFile(path.resolve(process.cwd(), template.filepath), 'utf-8');

    const templateData = {
      CANDIDATE_NAME: credential.application?.fullName || "",
      ORGANIZATION_NAME: orgName,
      ACCREDITATION_SCOPE: credential.application?.expertiseArea || "",
      CERTIFICATE_ID: credential.credentialId, // Note: standard schema uses credentialId for this
      CREDENTIAL_ID: credential.credentialId,
      REGISTRATION_NUMBER: credential.application?.registrationNumber || credential.organization?.registrationNumber || "",
      ISSUE_DATE: credential.issueDate.toLocaleDateString(),
      EXPIRY_DATE: credential.expiryDate.toLocaleDateString(),
      STANDARD: credential.standard,
      QR_CODE: credential.qrCode || "",
      VERIFICATION_URL: credential.verificationUrl
    };

    const populatedHtml = certificateGeneratorService.populateTemplate(htmlContent, templateData);
    const pdfBuffer = await certificateGeneratorService.generatePdfBuffer(populatedHtml);

    // Save to local storage
    const storageDir = getStorageDir();
    const filename = `${credential.credentialId.replace(/[^a-zA-Z0-9-]/g, "_")}.pdf`;
    const filePath = path.join(storageDir, filename);
    const dbPath = `/storage/certificates/${filename}`;

    fs.writeFileSync(filePath, pdfBuffer);

    // Update DB
    const updated = await prisma.credential.update({
      where: { id },
      data: {
        certificateGenerated: true,
        certificatePath: dbPath,
        generatedAt: new Date(),
        generatedById: req.admin.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        entityType: "CREDENTIAL",
        entityId: id,
        action: "GENERATE",
        newData: { certificatePath: dbPath },
        ipAddress: req.ip ?? null,
        userAgent: typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : undefined,
      },
    });


    res.status(200).json(new ApiResponse(200, { credential: updated, certificatePath: dbPath }, "Certificate generated and stored successfully"));
  });

  // GET /api/v1/credentials/:id/certificate/download
  downloadCertificate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const inline = req.query.inline === "true";

    const credential = await prisma.credential.findFirst({
      where: { id, deletedAt: null },
    });
    if (!credential) throw new ApiError(404, "Credential not found");
    if (!credential.certificatePath || !credential.certificateGenerated) {
      throw new ApiError(400, "Certificate has not been generated yet");
    }

    const filename = path.basename(credential.certificatePath);
    const absolutePath = path.join(process.cwd(), credential.certificatePath.replace(/^\//, ""));

    if (!fs.existsSync(absolutePath)) {
      throw new ApiError(404, "Certificate file not found on server");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${inline ? "inline" : "attachment"}; filename="${filename}"`,
    );
    fs.createReadStream(absolutePath).pipe(res);
  });

  // POST /api/v1/credentials/:id/send-email
  sendCertificateEmail = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.admin) throw new ApiError(401, "Not authenticated");
    const id = String(req.params.id);
    const { recipientEmail, subject, customMessage } = req.body;

    if (!recipientEmail) throw new ApiError(400, "Recipient email is required");

    const credential = await prisma.credential.findFirst({
      where: { id, deletedAt: null },
      include: { organization: true, application: true },
    });
    if (!credential) throw new ApiError(404, "Credential not found");
    if (!credential.certificateGenerated || !credential.certificatePath) {
      throw new ApiError(400, "Certificate must be generated before sending email");
    }

    const absolutePath = path.join(process.cwd(), credential.certificatePath.replace(/^\//, ""));
    if (!fs.existsSync(absolutePath)) throw new ApiError(404, "Certificate file not found");

    const pdfBuffer = fs.readFileSync(absolutePath);
    const orgName = credential.organization?.organizationName
      || credential.application?.company
      || credential.application?.fullName
      || "Applicant";

    await EmailService.sendCertificateEmail({
      to: recipientEmail,
      applicantName: credential.application?.fullName || orgName,
      credentialId: credential.credentialId,
      issueDate: credential.issueDate.toLocaleDateString(),
      expiryDate: credential.expiryDate.toLocaleDateString(),
      verificationLink: credential.verificationUrl,
      pdfBuffer,
      customMessage,
    });

    const isResend = credential.emailSent;

    const updatedCredential = await prisma.credential.update({
      where: { id },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
        emailSentBy: req.admin.fullName || "System",
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        entityType: "CREDENTIAL",
        entityId: id,
        action: "SEND_EMAIL",
        newData: { recipient: recipientEmail },
        ipAddress: req.ip ?? null,
        userAgent: typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : undefined,
      },
    });

    res.status(200).json(new ApiResponse(200, { credential: updatedCredential }, "Certificate email sent successfully"));
  });

  // GET /api/v1/credentials/:id/email-logs
  getEmailLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const emailLogs = await prisma.emailLog.findMany({
      where: { credentialId: id },
      orderBy: { sentAt: "desc" },
    });
    res.status(200).json(new ApiResponse(200, { emailLogs }, "Email logs fetched successfully"));
  });

  // GET /api/v1/credentials/:id/audit-logs
  getCredentialAuditLogs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entityType: "CREDENTIAL",
        entityId: id,
      },
      orderBy: { timestamp: "desc" },
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
    res.status(200).json(new ApiResponse(200, { auditLogs }, "Audit logs fetched successfully"));
  });

  // PATCH /api/v1/credentials/:id/status
  updateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.admin) throw new ApiError(401, "Not authenticated");
    const id = String(req.params.id);
    const { status } = req.body;

    if (!["VALID", "SUSPENDED", "REVOKED", "EXPIRED"].includes(status)) {
      throw new ApiError(400, "Invalid status");
    }

    const credential = await prisma.credential.findFirst({ where: { id, deletedAt: null } });
    if (!credential) throw new ApiError(404, "Credential not found");

    const updated = await prisma.credential.update({ where: { id }, data: { status } });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        entityType: "CREDENTIAL",
        entityId: id,
        action: "STATUS_CHANGE",
        oldData: { status: credential.status },
        newData: { status },
        ipAddress: req.ip ?? null,
        userAgent: typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : undefined,
      },
    });

    res.status(200).json(new ApiResponse(200, { credential: updated }, "Credential status updated successfully"));
  });
}

export default new CredentialsController();
