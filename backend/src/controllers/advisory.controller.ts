import { Request, Response } from "express";
import prisma from "../config/Database.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  applyAdvisorySchema,
  applicationDecisionSchema,
  applicationQuerySchema,
} from "../validators/advisory.validators.js";

export class AdvisoryController {
  // POST /api/v1/advisory/apply  (public — no auth required)
  applyForAdvisory = asyncHandler(async (req: Request, res: Response) => {
    const body = applyAdvisorySchema.parse(req.body);

    // Prevent duplicate applications from same email
    const existing = await prisma.advisoryApplication.findFirst({
      where: { email: body.email, deletedAt: null, applicationStatus: { in: ["PENDING", "APPROVED"] } },
    });
    if (existing) {
      throw new ApiError(409, "An active application from this email already exists");
    }

    const application = await prisma.advisoryApplication.create({
      data: {
        ...body,
        applicationStatus: "PENDING",
      },
    });

    res.status(201).json(
      new ApiResponse(201, { application }, "Application submitted successfully"),
    );
  });

  // GET /api/v1/advisory/applications
  getApplications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = applicationQuerySchema.parse(req.query);
    const { page, limit, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.applicationStatus = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { expertiseArea: { contains: search, mode: "insensitive" } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.advisoryApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reviewedBy: { select: { id: true, fullName: true } },
        },
      }),
      prisma.advisoryApplication.count({ where }),
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          applications,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
        "Applications fetched successfully",
      ),
    );
  });

  // POST /api/v1/advisory/applications/:id/decision
  decideApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const body = applicationDecisionSchema.parse(req.body);

    if (!req.admin) throw new ApiError(401, "Not authenticated");

    const application = await prisma.advisoryApplication.findFirst({
      where: { id, deletedAt: null },
    });
    if (!application) throw new ApiError(404, "Application not found");
    if (application.applicationStatus !== "PENDING") {
      throw new ApiError(400, "This application has already been reviewed");
    }

    const updatedApplication = await prisma.advisoryApplication.update({
      where: { id },
      data: {
        applicationStatus: body.status,
        reviewedById: req.admin.id,
        reviewedAt: new Date(),
      },
    });

    // If APPROVED → create an Advisor record
    if (body.status === "APPROVED") {
      await prisma.advisor.create({
        data: {
          advisoryApplicationId: application.id,
          fullName: application.fullName,
          linkedinUrl: application.linkedinUrl,
          organization: application.company,
          designation: application.designation,
          expertiseArea: application.expertiseArea,
          experienceYears: application.experienceYears,
          status: "ACTIVE",
        },
      });
    }

    res.status(200).json(
      new ApiResponse(200, { application: updatedApplication }, `Application ${body.status.toLowerCase()} successfully`),
    );
  });

  // GET /api/v1/public/advisors
  getPublicAdvisors = asyncHandler(async (req: Request, res: Response) => {
    const advisors = await prisma.advisor.findMany({
      where: { deletedAt: null, status: "ACTIVE" },
      select: {
        id: true,
        fullName: true,
        linkedinUrl: true,
        organization: true,
        designation: true,
        expertiseArea: true,
        experienceYears: true,
        profilePhoto: true,
        bio: true,
      },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(new ApiResponse(200, { advisors }, "Public advisors fetched successfully"));
  });
}

export default AdvisoryController;
