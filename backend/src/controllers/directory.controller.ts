import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validate as isUuid } from "uuid";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/directory/search
// Body: { certificateId: string }
// Returns 200 { success: true, uuid } | 404 { success: false, message }
// Always returns JSON — never HTML.
// ─────────────────────────────────────────────────────────────────────────────
export const searchCertificate = async (req: Request, res: Response) => {
  try {
    const { certificateId } = req.body;

    if (!certificateId || typeof certificateId !== "string" || !certificateId.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Certificate ID is required" });
    }

    const credential = await prisma.credential.findUnique({
      where: { certificateId: certificateId.trim() },
      select: { id: true },
    });

    if (!credential) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    return res.status(200).json({ success: true, uuid: credential.id });
  } catch (error) {
    console.error("Error searching certificate:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const PROFILE_SELECT = {
  id: true,
  candidateName: true,
  organizationName: true,
  credentialId: true,
  certificateId: true,
  registrationNumber: true,
  issueDate: true,
  expiryDate: true,
  status: true,
  certificatePath: true,
  verificationUrl: true,
  standard: true,
  qrCode: true,
  organization: {
    select: {
      organizationName: true,
      country: true,
    },
  },
  application: {
    select: {
      fullName: true,
      company: true,
      country: true,
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build the public credential payload from a DB record
// ─────────────────────────────────────────────────────────────────────────────
function buildProfilePayload(credential: any) {
  let category = "Professional Certification";
  if (credential.certificateId && credential.certificateId.startsWith("IUCB-ADV")) category = "Advisory Services";
  if (credential.certificateId && credential.certificateId.startsWith("IUCB-AUD")) category = "Certified Auditor";
  if (credential.certificateId && credential.certificateId.startsWith("IUCB-TI")) category = "Training Institute";
  if (credential.certificateId && credential.certificateId.startsWith("IUCB-ACB")) category = "Accredited Body";

  // Resolve candidateName: direct field → application.fullName → empty
  const candidateName =
    (credential.candidateName && credential.candidateName.trim()) ||
    (credential.application?.fullName && credential.application.fullName.trim()) ||
    "";

  // Resolve organizationName: direct field → organization.organizationName → application.company → empty
  const organizationName =
    (credential.organizationName && credential.organizationName.trim()) ||
    (credential.organization?.organizationName && credential.organization.organizationName.trim()) ||
    (credential.application?.company && credential.application.company.trim()) ||
    "";

  // Resolve country: organization → application → empty
  const country =
    (credential.organization?.country && credential.organization.country.trim()) ||
    (credential.application?.country && credential.application.country.trim()) ||
    "";

  return {
    candidateName,
    organizationName,
    instituteName: organizationName, // backwards compat
    country,
    credentialId: credential.credentialId,
    certificateId: credential.certificateId,
    registrationNumber: credential.registrationNumber,
    category,
    issueDate: credential.issueDate,
    expiryDate: credential.expiryDate,
    status: credential.status,
    certificatePath: credential.certificatePath,
    verificationUrl: credential.verificationUrl,
    standard: credential.standard,
    issuedBy: "IUCB Administration",
    verificationTimestamp: new Date().toISOString(),
    qrCode: credential.qrCode,
    hasPdf: !!credential.certificatePath,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/directory/:uuid
// Returns full credential profile
// ─────────────────────────────────────────────────────────────────────────────
export const getCertificateByUuid = async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;

    if (!uuid || !isUuid(uuid)) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or missing UUID" });
    }

    const credential = await prisma.credential.findUnique({
      where: { id: uuid as string },
      select: PROFILE_SELECT,
    });

    if (!credential) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    return res.status(200).json({ success: true, data: buildProfilePayload(credential) });
  } catch (error) {
    console.error("Error fetching certificate by UUID:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/directory/:uuid/profile
// Same as getCertificateByUuid but kept for backward compatibility.
// ─────────────────────────────────────────────────────────────────────────────
export const getCertificateProfile = async (req: Request, res: Response) => {
  try {
    const uuid = req.params.uuid as string;

    if (!uuid || !isUuid(uuid)) {
      return res.status(404).json({ success: false, message: "Invalid UUID format" });
    }

    const credential = await prisma.credential.findUnique({
      where: { id: uuid },
      select: PROFILE_SELECT,
    });

    if (!credential) {
      return res.status(404).json({ success: false, message: "Certificate not found" });
    }

    // Return the flat payload (not nested under `data`)
    return res.status(200).json(buildProfilePayload(credential));
  } catch (error) {
    console.error("Error fetching certificate profile:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/directory/:uuid/download
// Downloads the PDF file.
// ─────────────────────────────────────────────────────────────────────────────
export const downloadCertificate = async (req: Request, res: Response) => {
  try {
    const uuid = req.params.uuid as string;

    if (!uuid || !isUuid(uuid)) {
      return res.status(404).json({ success: false, message: "Invalid UUID format" });
    }

    const credential = await prisma.credential.findUnique({
      where: { id: uuid },
      select: { id: true, certificatePath: true, status: true, candidateName: true, certificateId: true, credentialId: true },
    });

    if (!credential || !credential.certificatePath) {
      return res.status(404).json({ success: false, message: "Certificate file not found" });
    }

    // Fix absolute path resolution (strip leading slash if any)
    const normalizedPath = credential.certificatePath.replace(/^[\/\\]+/, "");
    const absolutePath = path.resolve(process.cwd(), normalizedPath);

    if (!fs.existsSync(absolutePath)) {
      console.error(`File not found at path: ${absolutePath}`);
      return res.status(404).json({ success: false, message: "Certificate file not found on server" });
    }

    const fileName = `${credential.certificateId || credential.credentialId}.pdf`;
    return res.download(absolutePath, fileName);
  } catch (error) {
    console.error("Error downloading certificate:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/directory/:uuid/view
// Views the PDF inline.
// ─────────────────────────────────────────────────────────────────────────────
export const viewCertificate = async (req: Request, res: Response) => {
  try {
    const uuid = req.params.uuid as string;

    if (!uuid || !isUuid(uuid)) {
      return res.status(404).json({ success: false, message: "Invalid UUID format" });
    }

    const credential = await prisma.credential.findUnique({
      where: { id: uuid },
      select: { id: true, certificatePath: true, status: true, candidateName: true, certificateId: true, credentialId: true },
    });

    if (!credential || !credential.certificatePath) {
      return res.status(404).json({ success: false, message: "Certificate file not found" });
    }

    // Fix absolute path resolution (strip leading slash if any)
    const normalizedPath = credential.certificatePath.replace(/^[\/\\]+/, "");
    const absolutePath = path.resolve(process.cwd(), normalizedPath);

    if (!fs.existsSync(absolutePath)) {
      console.error(`File not found at path: ${absolutePath}`);
      return res.status(404).json({ success: false, message: "Certificate file not found on server" });
    }

    const fileName = `${credential.certificateId || credential.credentialId}.pdf`;
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/pdf");

    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error viewing certificate:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared helper: resolve credential record from ?credential query param
// ─────────────────────────────────────────────────────────────────────────────
async function getCredentialByParam(param: string) {
  return prisma.credential.findFirst({
    where: {
      OR: [
        { credentialId: param },
        { certificateId: param },
      ],
    },
    select: {
      id: true,
      certificatePath: true,
      candidateName: true,
      certificateId: true,
      credentialId: true,
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/verify/download?credential=...
// Downloads the PDF for a credential looked up by credentialId or certificateId
// ─────────────────────────────────────────────────────────────────────────────
export const downloadByCredential = async (req: Request, res: Response) => {
  try {
    const credentialParam = req.query.credential as string;
    if (!credentialParam) {
      return res.status(400).json({ success: false, message: "credential query param required" });
    }
    const credential = await getCredentialByParam(credentialParam.trim());
    if (!credential || !credential.certificatePath) {
      return res.status(404).json({ success: false, message: "Certificate file not found" });
    }
    const normalizedPath = credential.certificatePath.replace(/^[\/\\]+/, "");
    const absolutePath = path.resolve(process.cwd(), normalizedPath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: "Certificate file missing on server" });
    }
    const fileName = `${credential.certificateId || credential.credentialId}.pdf`;
    return res.download(absolutePath, fileName);
  } catch (error) {
    console.error("Error downloading certificate:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/verify/view?credential=...
// Streams PDF inline for a credential looked up by credentialId or certificateId
// ─────────────────────────────────────────────────────────────────────────────
export const viewByCredential = async (req: Request, res: Response) => {
  try {
    const credentialParam = req.query.credential as string;
    if (!credentialParam) {
      return res.status(400).json({ success: false, message: "credential query param required" });
    }
    const credential = await getCredentialByParam(credentialParam.trim());
    if (!credential || !credential.certificatePath) {
      return res.status(404).json({ success: false, message: "Certificate file not found" });
    }
    const normalizedPath = credential.certificatePath.replace(/^[\/\\]+/, "");
    const absolutePath = path.resolve(process.cwd(), normalizedPath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: "Certificate file missing on server" });
    }
    const fileName = `${credential.certificateId || credential.credentialId}.pdf`;
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.setHeader("Content-Type", "application/pdf");
    fs.createReadStream(absolutePath).pipe(res);
  } catch (error) {
    console.error("Error viewing certificate:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyCertificate = async (req: Request, res: Response) => {
  try {
    const credentialParam = req.query.credential as string;

    if (!credentialParam || typeof credentialParam !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Credential ID is required" });
    }

    const trimmedParam = credentialParam.trim();

    const credential = await prisma.credential.findFirst({
      where: {
        OR: [
          { credentialId: trimmedParam },
          { certificateId: trimmedParam }
        ]
      },
      select: PROFILE_SELECT,
    });

    if (!credential) {
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found" });
    }

    return res.status(200).json({ success: true, data: buildProfilePayload(credential) });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
