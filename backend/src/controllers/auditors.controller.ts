import { Request, Response } from "express";
import prisma from "../config/Database.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  createAuditorSchema,
  updateAuditorSchema,
  auditorQuerySchema,
} from "../validators/auditors.validators.js";

export class AuditorsController {
  // GET /api/v1/auditors
  getAuditors = asyncHandler(async (req: Request, res: Response) => {
    const query = auditorQuerySchema.parse(req.query);
    const { page, limit, organizationId, tier, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (organizationId) where.organizationId = organizationId;
    if (tier) where.tier = tier;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { specialization: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ];
    }
    if (query.country) where.country = query.country;
    if (query.state) where.state = query.state;
    if (query.city) where.city = query.city;

    const [auditors, total] = await Promise.all([
      prisma.auditor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          organization: {
            select: { id: true, organizationName: true, registrationNumber: true },
          },
        },
      }),
      prisma.auditor.count({ where }),
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          auditors,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
        "Auditors fetched successfully",
      ),
    );
  });

  // POST /api/v1/auditors
  createAuditor = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const body = createAuditorSchema.parse(req.body);

    const org = await prisma.organization.findFirst({
      where: { id: body.organizationId, deletedAt: null },
    });
    if (!org) throw new ApiError(404, "Organization not found");

    const existing = await prisma.auditor.findFirst({
      where: { email: body.email, deletedAt: null },
    });
    if (existing) throw new ApiError(409, "An auditor with this email already exists");

    const auditor = await prisma.auditor.create({
      data: body,
      include: {
        organization: { select: { id: true, organizationName: true } },
      },
    });

    res.status(201).json(new ApiResponse(201, { auditor }, "Auditor created successfully"));
  });

  // GET /api/v1/auditors/:id
  getAuditorById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const auditor = await prisma.auditor.findFirst({
      where: { id, deletedAt: null },
      include: {
        organization: { select: { id: true, organizationName: true } },
        credentials: { where: { deletedAt: null }, select: { id: true, credentialId: true, standard: true, status: true } },
      },
    });
    if (!auditor) throw new ApiError(404, "Auditor not found");
    res.status(200).json(new ApiResponse(200, { auditor }, "Auditor fetched successfully"));
  });

  // PUT /api/v1/auditors/:id
  updateAuditor = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const body = updateAuditorSchema.parse(req.body);

    const existing = await prisma.auditor.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new ApiError(404, "Auditor not found");

    if (body.organizationId) {
      const org = await prisma.organization.findFirst({
        where: { id: body.organizationId, deletedAt: null },
      });
      if (!org) throw new ApiError(404, "Organization not found");
    }

    const auditor = await prisma.auditor.update({
      where: { id },
      data: body,
      include: { organization: { select: { id: true, organizationName: true } } },
    });
    res.status(200).json(new ApiResponse(200, { auditor }, "Auditor updated successfully"));
  });

  // DELETE /api/v1/auditors/:id
  deleteAuditor = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const existing = await prisma.auditor.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new ApiError(404, "Auditor not found");

    await prisma.auditor.update({ where: { id }, data: { deletedAt: new Date() } });
    res.status(200).json(new ApiResponse(200, null, "Auditor deleted successfully"));
  });
}

export default AuditorsController;
