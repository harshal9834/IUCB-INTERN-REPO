import { Request, Response } from "express";
import prisma from "../config/Database.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { EmailService } from "../services/email.service.js";
import {
  applyAccreditationSchema,
  applyAuditorSchema,
  applyTrainingInstituteSchema,
  applyAdvisorySchema,
  applicationDecisionSchema,
  applicationQuerySchema,
} from "../validators/applications.validators.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateApplicationNumber(type: string): string {
  const prefixes: Record<string, string> = {
    ACCREDITATION: "ACC",
    AUDITOR: "AUD",
    TRAINING_INSTITUTE: "TRN",
    ADVISORY: "ADV",
  };
  const prefix = prefixes[type] ?? "APP";
  const timestamp = Date.now().toString().slice(-6);
  return `APP-${prefix}-${timestamp}`;
}

const TYPE_LABELS: Record<string, string> = {
  ACCREDITATION: "Accreditation Organization",
  AUDITOR: "Auditor",
  TRAINING_INSTITUTE: "Training Institute",
  ADVISORY: "Advisory Board",
};

// ── Public Application Submissions ───────────────────────────────────────────

export class PublicApplicationsController {
  // POST /api/v1/accreditation/apply
  applyAccreditation = asyncHandler(async (req: Request, res: Response) => {
    const body = applyAccreditationSchema.parse(req.body);

    const application = await prisma.application.create({
      data: {
        applicationType: "ACCREDITATION",
        applicationNumber: generateApplicationNumber("ACCREDITATION"),
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        company: body.company,
        organizationType: body.organizationType,
        registrationNumber: body.registrationNumber,
        country: body.country,
        address: body.address,
        website: body.website || null,
        appliedStandard: body.appliedStandard,
        message: body.message ?? null,
        applicationStatus: "PENDING",
      },
    });

    await EmailService.sendSubmissionConfirmationEmail({
      to: application.email,
      applicantName: application.fullName,
      applicationType: "Accreditation",
      applicationNumber: application.applicationNumber!,
    });

    res.status(201).json(
      new ApiResponse(201, { application }, "Accreditation application submitted successfully"),
    );
  });

  // POST /api/v1/auditor/apply
  applyAuditor = asyncHandler(async (req: Request, res: Response) => {
    const body = applyAuditorSchema.parse(req.body);

    const application = await prisma.application.create({
      data: {
        applicationType: "AUDITOR",
        applicationNumber: generateApplicationNumber("AUDITOR"),
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        company: body.company,
        designation: body.designation,
        country: body.country,
        appliedStandard: body.appliedStandard,
        experienceYears: body.experienceYears,
        statementOfMerit: body.statementOfMerit ?? null,
        linkedinUrl: body.linkedinUrl || null,
        applicationStatus: "PENDING",
      },
    });

    await EmailService.sendSubmissionConfirmationEmail({
      to: application.email,
      applicantName: application.fullName,
      applicationType: "Auditor",
      applicationNumber: application.applicationNumber!,
    });

    res.status(201).json(
      new ApiResponse(201, { application }, "Auditor application submitted successfully"),
    );
  });

  // POST /api/v1/training-institute/apply
  applyTrainingInstitute = asyncHandler(async (req: Request, res: Response) => {
    const body = applyTrainingInstituteSchema.parse(req.body);

    const application = await prisma.application.create({
      data: {
        applicationType: "TRAINING_INSTITUTE",
        applicationNumber: generateApplicationNumber("TRAINING_INSTITUTE"),
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        company: body.company,
        organizationType: body.organizationType,
        country: body.country,
        address: body.address,
        website: body.website || null,
        appliedStandard: body.appliedStandard,
        applicationStatus: "PENDING",
      },
    });

    await EmailService.sendSubmissionConfirmationEmail({
      to: application.email,
      applicantName: application.fullName,
      applicationType: "Training Institute",
      applicationNumber: application.applicationNumber!,
    });

    res.status(201).json(
      new ApiResponse(201, { application }, "Training institute application submitted successfully"),
    );
  });

  // POST /api/v1/advisory/apply
  applyAdvisory = asyncHandler(async (req: Request, res: Response) => {
    const body = applyAdvisorySchema.parse(req.body);

    const existing = await prisma.application.findFirst({
      where: {
        email: body.email,
        applicationType: "ADVISORY",
        deletedAt: null,
        applicationStatus: { in: ["PENDING", "APPROVED"] },
      },
    });
    if (existing) {
      throw new ApiError(409, "An active advisory application from this email already exists");
    }

    const application = await prisma.application.create({
      data: {
        applicationType: "ADVISORY",
        applicationNumber: generateApplicationNumber("ADVISORY"),
        fullName: body.fullName,
        email: body.email,
        linkedinUrl: body.linkedinUrl ?? null,
        company: body.company,
        designation: body.designation,
        expertiseArea: body.expertiseArea,
        experienceYears: body.experienceYears,
        statementOfMerit: body.statementOfMerit,
        resumeUrl: body.resumeUrl ?? null,
        applicationStatus: "PENDING",
      },
    });

    await EmailService.sendSubmissionConfirmationEmail({
      to: application.email,
      applicantName: application.fullName,
      applicationType: "Advisory Board",
      applicationNumber: application.applicationNumber!,
    });

    res.status(201).json(
      new ApiResponse(201, { application }, "Advisory application submitted successfully"),
    );
  });
}

// ── Admin Applications Management ────────────────────────────────────────────

export class AdminApplicationsController {
  // GET /api/v1/applications
  getApplications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = applicationQuerySchema.parse(req.query);
    const { page, limit, status, type, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.applicationStatus = status;
    if (type) where.applicationType = type;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { applicationNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reviewedBy: { select: { id: true, fullName: true } },
        },
      }),
      prisma.application.count({ where }),
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

  // GET /api/v1/applications/:id
  getApplicationById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);

    const application = await prisma.application.findFirst({
      where: { id, deletedAt: null },
      include: {
        reviewedBy: { select: { id: true, fullName: true, email: true } },
        advisor: true,
      },
    });

    if (!application) throw new ApiError(404, "Application not found");

    res.status(200).json(
      new ApiResponse(200, { application }, "Application fetched successfully"),
    );
  });

  // PATCH /api/v1/applications/:id/approve
  approveApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const body = applicationDecisionSchema.parse({ ...req.body, status: "APPROVED" });

    if (!req.admin) throw new ApiError(401, "Not authenticated");

    const application = await prisma.application.findFirst({
      where: { id, deletedAt: null },
    });
    if (!application) throw new ApiError(404, "Application not found");
    if (application.applicationStatus !== "PENDING") {
      throw new ApiError(400, "This application has already been reviewed");
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        applicationStatus: "APPROVED",
        internalNotes: body.remarks ?? application.internalNotes,
        reviewedById: req.admin.id,
        reviewedAt: new Date(),
      },
    });

    const typeLabel = TYPE_LABELS[application.applicationType] ?? "Application";

    // ── Type-specific record creation ────────────────────────────────────────
    if (application.applicationType === "ADVISORY") {
      // Create Advisor profile
      await prisma.advisor.create({
        data: {
          applicationId: application.id,
          fullName: application.fullName,
          linkedinUrl: application.linkedinUrl ?? null,
          organization: application.company ?? "N/A",
          designation: application.designation ?? "N/A",
          expertiseArea: application.expertiseArea ?? "General",
          experienceYears: application.experienceYears ?? 0,
          status: "ACTIVE",
        },
      });
      await EmailService.sendWelcomeEmail({
        to: application.email,
        applicantName: application.fullName,
        role: "Advisory Board Member",
      });
    } else if (application.applicationType === "ACCREDITATION") {
      // Auto-create Organization
      const accDate = new Date();
      const expDate = new Date();
      expDate.setFullYear(expDate.getFullYear() + 5);

      await prisma.organization.create({
        data: {
          organizationName: application.company ?? application.fullName,
          registrationNumber: application.registrationNumber ?? `AUTO-${Date.now()}`,
          country: application.country ?? "N/A",
          address: application.country ?? "N/A",
          email: application.email,
          phone: application.phone ?? "N/A",
          website: application.website ?? null,
          accreditationStatus: "ACTIVE",
          accreditationDate: accDate,
          expiryDate: expDate,
        },
      });
      await EmailService.sendApprovalEmail({
        to: application.email,
        applicantName: application.fullName,
        applicationType: typeLabel,
        applicationNumber: application.applicationNumber ?? undefined,
      });
    } else if (application.applicationType === "AUDITOR") {
      // Auto-create Auditor profile (linked to first available org for now)
      const firstOrg = await prisma.organization.findFirst({
        where: { deletedAt: null, accreditationStatus: "ACTIVE" },
      });

      await prisma.auditor.create({
        data: {
          fullName: application.fullName,
          email: application.email,
          phone: application.phone ?? "N/A",
          organizationId: firstOrg!.id,
          tier: "ASSOCIATE",
          specialization: application.appliedStandard ?? "General",
          experienceYears: application.experienceYears ?? 0,
          status: "ACTIVE",
        },
      });
      await EmailService.sendWelcomeEmail({
        to: application.email,
        applicantName: application.fullName,
        role: "IUCB Certified Auditor",
      });
    } else if (application.applicationType === "TRAINING_INSTITUTE") {
      // Auto-create Training Institute record
      await prisma.trainingInstitute.create({
        data: {
          instituteName: application.company ?? application.fullName,
          registrationNumber: application.registrationNumber ?? `TRN-AUTO-${Date.now()}`,
          country: application.country ?? "N/A",
          address: application.country ?? "N/A",
          email: application.email,
          phone: application.phone ?? "N/A",
          website: application.website ?? null,
          status: "ACTIVE",
        },
      });
      await EmailService.sendApprovalEmail({
        to: application.email,
        applicantName: application.fullName,
        applicationType: typeLabel,
        applicationNumber: application.applicationNumber ?? undefined,
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        entityType: "APPLICATION",
        entityId: application.id,
        action: "APPROVE",
        oldData: { applicationStatus: "PENDING" },
        newData: { applicationStatus: "APPROVED" },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    res.status(200).json(
      new ApiResponse(200, { application: updatedApplication }, "Application approved successfully"),
    );
  });

  // PATCH /api/v1/applications/:id/reject
  rejectApplication = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const body = applicationDecisionSchema.parse({ ...req.body, status: "REJECTED" });

    if (!req.admin) throw new ApiError(401, "Not authenticated");

    const application = await prisma.application.findFirst({
      where: { id, deletedAt: null },
    });
    if (!application) throw new ApiError(404, "Application not found");
    if (application.applicationStatus !== "PENDING") {
      throw new ApiError(400, "This application has already been reviewed");
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        applicationStatus: "REJECTED",
        internalNotes: body.remarks ?? application.internalNotes,
        reviewedById: req.admin.id,
        reviewedAt: new Date(),
      },
    });

    const typeLabel = TYPE_LABELS[application.applicationType] ?? "Application";

    await EmailService.sendRejectionEmail({
      to: application.email,
      applicantName: application.fullName,
      applicationType: typeLabel,
      reason: body.remarks,
    });

    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        entityType: "APPLICATION",
        entityId: application.id,
        action: "REJECT",
        oldData: { applicationStatus: "PENDING" },
        newData: { applicationStatus: "REJECTED", remarks: body.remarks },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    res.status(200).json(
      new ApiResponse(200, { application: updatedApplication }, "Application rejected successfully"),
    );
  });
}

export default { PublicApplicationsController, AdminApplicationsController };
