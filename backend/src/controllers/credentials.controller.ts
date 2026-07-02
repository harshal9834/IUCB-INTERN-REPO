import { Request, Response } from "express";
import prisma from "../config/Database.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  issueCredentialSchema,
  revokeCredentialSchema,
  credentialQuerySchema,
} from "../validators/credentials.validators.js";

export class CredentialsController {
  // POST /api/v1/credentials/issue
  issueCredential = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const body = issueCredentialSchema.parse(req.body);

    const org = await prisma.organization.findFirst({
      where: { id: body.organizationId, deletedAt: null },
    });
    if (!org) throw new ApiError(404, "Organization not found");

    const auditor = await prisma.auditor.findFirst({
      where: { id: body.auditorId, deletedAt: null },
    });
    if (!auditor) throw new ApiError(404, "Auditor not found");

    const existing = await prisma.credential.findFirst({
      where: { credentialNumber: body.credentialNumber, deletedAt: null },
    });
    if (existing) throw new ApiError(409, "A credential with this number already exists");

    // Generate QR code placeholder (in production this would be a real QR service)
    const qrCode = `QR-${body.credentialNumber}-${Date.now()}`;

    const credential = await prisma.credential.create({
      data: {
        ...body,
        status: body.status ?? "VALID",
        qrCode,
      },
      include: {
        organization: { select: { id: true, organizationName: true } },
        auditor: { select: { id: true, fullName: true } },
      },
    });

    res.status(201).json(new ApiResponse(201, { credential }, "Credential issued successfully"));
  });

  // GET /api/v1/credentials
  getCredentials = asyncHandler(async (req: Request, res: Response) => {
    const query = credentialQuerySchema.parse(req.query);
    const { page, limit, status, organizationId, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (organizationId) where.organizationId = organizationId;
    if (search) {
      where.OR = [
        { credentialNumber: { contains: search, mode: "insensitive" } },
        { standard: { contains: search, mode: "insensitive" } },
      ];
    }

    const [credentials, total] = await Promise.all([
      prisma.credential.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          organization: { select: { id: true, organizationName: true } },
          auditor: { select: { id: true, fullName: true } },
        },
      }),
      prisma.credential.count({ where }),
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          credentials,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
        "Credentials fetched successfully",
      ),
    );
  });

  // GET /api/v1/credentials/:id
  getCredentialById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const credential = await prisma.credential.findFirst({
      where: { id, deletedAt: null },
      include: {
        organization: { select: { id: true, organizationName: true } },
        auditor: { select: { id: true, fullName: true } },
      },
    });
    if (!credential) throw new ApiError(404, "Credential not found");
    res.status(200).json(new ApiResponse(200, { credential }, "Credential fetched successfully"));
  });

  // POST /api/v1/credentials/:id/revoke
  revokeCredential = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    revokeCredentialSchema.parse(req.body);

    const existing = await prisma.credential.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new ApiError(404, "Credential not found");
    if (existing.status === "REVOKED") throw new ApiError(400, "Credential is already revoked");

    const credential = await prisma.credential.update({
      where: { id },
      data: { status: "REVOKED" },
      include: {
        organization: { select: { id: true, organizationName: true } },
        auditor: { select: { id: true, fullName: true } },
      },
    });

    res.status(200).json(new ApiResponse(200, { credential }, "Credential revoked successfully"));
  });
}

export default CredentialsController;
