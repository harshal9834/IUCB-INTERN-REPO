import { Request, Response } from "express";
import prisma from "../config/Database.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { EmailService } from "../services/email.service.js";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  updateOrganizationStatusSchema,
  organizationQuerySchema,
} from "../validators/organizations.validators.js";

export class OrganizationsController {
  // GET /api/v1/organizations
  getOrganizations = asyncHandler(async (req: Request, res: Response) => {
    const query = organizationQuerySchema.parse(req.query);
    const { page, limit, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.accreditationStatus = status;
    if (search) {
      where.OR = [
        { organizationName: { contains: search, mode: "insensitive" } },
        { registrationNumber: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ];
    }
    if (query.country) where.country = query.country;
    if (query.state) where.state = query.state;
    if (query.city) where.city = query.city;

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.organization.count({ where }),
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          organizations,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
        "Organizations fetched successfully",
      ),
    );
  });

  // POST /api/v1/organizations
  createOrganization = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const body = createOrganizationSchema.parse(req.body);

    const existing = await prisma.organization.findFirst({
      where: { registrationNumber: body.registrationNumber, deletedAt: null },
    });
    if (existing) {
      throw new ApiError(409, "An organization with this registration number already exists");
    }

    const organization = await prisma.organization.create({
      data: {
        ...body,
        accreditationStatus: body.accreditationStatus ?? "ACTIVE",
      },
    });

    res.status(201).json(new ApiResponse(201, { organization }, "Organization created successfully"));
  });

  // GET /api/v1/organizations/:id
  getOrganizationById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const organization = await prisma.organization.findFirst({
      where: { id, deletedAt: null },
      include: {
        auditors: { where: { deletedAt: null }, select: { id: true, fullName: true, tier: true, status: true } },
        credentials: { where: { deletedAt: null }, select: { id: true, credentialId: true, standard: true, status: true } },
      },
    });
    if (!organization) throw new ApiError(404, "Organization not found");
    res.status(200).json(new ApiResponse(200, { organization }, "Organization fetched successfully"));
  });

  // PATCH /api/v1/organizations/:id/status
  updateOrganizationStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const body = updateOrganizationStatusSchema.parse(req.body);

    const existing = await prisma.organization.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new ApiError(404, "Organization not found");

    const organization = await prisma.organization.update({
      where: { id },
      data: { accreditationStatus: body.status },
    });

    if (organization.email) {
      try {
        await EmailService.sendOrganizationStatusEmail({
          to: organization.email,
          orgName: organization.organizationName,
          status: organization.accreditationStatus,
          reason: (req.body as any).remarks || (req.body as any).reason,
        });
      } catch (e) {
        console.error(`[OrganizationsController] Failed to send status email to ${organization.email}:`, e);
      }
    }

    res.status(200).json(new ApiResponse(200, { organization }, "Organization status updated successfully"));
  });

  // PUT /api/v1/organizations/:id
  updateOrganization = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const body = updateOrganizationSchema.parse(req.body);

    const existing = await prisma.organization.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new ApiError(404, "Organization not found");

    const organization = await prisma.organization.update({ where: { id }, data: body });

    res.status(200).json(new ApiResponse(200, { organization }, "Organization updated successfully"));
  });

  // DELETE /api/v1/organizations/:id
  deleteOrganization = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const existing = await prisma.organization.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new ApiError(404, "Organization not found");

    await prisma.organization.update({ where: { id }, data: { deletedAt: new Date() } });

    res.status(200).json(new ApiResponse(200, null, "Organization deleted successfully"));
  });
}

export default OrganizationsController;
