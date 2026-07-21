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
        countryCode: body.countryCode,
        phoneCode: body.phoneCode,
        state: body.state,
        city: body.city,
        postalCode: body.postalCode,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        address: body.address,
        website: body.website || null,
        appliedStandard: body.appliedStandard,
        message: body.message ?? null,
        applicationStatus: "PENDING",
      },
    });


    try {
      await EmailService.sendSubmissionConfirmationEmail({
        to: application.email,
        applicantName: application.fullName,
        applicationType: "Accreditation",
        applicationNumber: application.applicationNumber!,
      });
    } catch (e) {
      console.error("Email delivery failed for application submission");
    }

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
        countryCode: body.countryCode,
        phoneCode: body.phoneCode,
        state: body.state,
        city: body.city,
        postalCode: body.postalCode,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        appliedStandard: body.appliedStandard,
        experienceYears: body.experienceYears,
        statementOfMerit: body.statementOfMerit ?? null,
        linkedinUrl: body.linkedinUrl || null,
        applicationStatus: "PENDING",
      },
    });


    try {
      await EmailService.sendSubmissionConfirmationEmail({
        to: application.email,
        applicantName: application.fullName,
        applicationType: "Auditor",
        applicationNumber: application.applicationNumber!,
      });
    } catch (e) {
      console.error("Email delivery failed for application submission");
    }

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
        countryCode: body.countryCode,
        phoneCode: body.phoneCode,
        state: body.state,
        city: body.city,
        postalCode: body.postalCode,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        address: body.address,
        website: body.website || null,
        appliedStandard: body.appliedStandard,
        applicationStatus: "PENDING",
      },
    });


    try {
      await EmailService.sendSubmissionConfirmationEmail({
        to: application.email,
        applicantName: application.fullName,
        applicationType: "Training Institute",
        applicationNumber: application.applicationNumber!,
      });
    } catch (e) {
      console.error("Email delivery failed for application submission");
    }

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
        phone: body.phone,
        country: body.country,
        countryCode: body.countryCode,
        phoneCode: body.phoneCode,
        state: body.state,
        city: body.city,
        postalCode: body.postalCode,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
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


    try {
      await EmailService.sendSubmissionConfirmationEmail({
        to: application.email,
        applicantName: application.fullName,
        applicationType: "Advisory Board",
        applicationNumber: application.applicationNumber!,
      });
    } catch (e) {
      console.error("Email delivery failed for application submission");
    }

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

    console.log("[DEBUG] Application received for approval. ID:", id);

    const application = await prisma.application.findFirst({
      where: { id, deletedAt: null },
    });
    if (!application) throw new ApiError(404, "Application not found");
    if (application.applicationStatus !== "PENDING") {
      throw new ApiError(400, "This application has already been reviewed");
    }

    console.log("[DEBUG] Application type:", application.applicationType);

    const typeLabel = TYPE_LABELS[application.applicationType] ?? "Application";
    let insertedId = "";
    let mappedTable = "";
    let insertedRecord: any = null;

    try {
      // ── Type-specific record creation ────────────────────────────────────────
      if (application.applicationType === "ADVISORY") {
        mappedTable = "Advisor";
        const advisorData = {
          applicationId: application.id,
          fullName: application.fullName,
          linkedinUrl: application.linkedinUrl ?? null,
          organization: application.company ?? "N/A",
          designation: application.designation ?? "N/A",
          expertiseArea: application.expertiseArea ?? "General",
          experienceYears: application.experienceYears ?? 0,
          status: "ACTIVE" as const,
          country: application.country ?? null,
          countryCode: application.countryCode ?? null,
          phoneCode: application.phoneCode ?? null,
          state: application.state ?? null,
          city: application.city ?? null,
          postalCode: application.postalCode ?? null,
          addressLine1: application.addressLine1 ?? null,
          addressLine2: application.addressLine2 ?? null,
          address: application.address ?? null,
        };
        console.log(`[DEBUG] Mapped table: ${mappedTable}`);
        console.log(`[DEBUG] Data before insertion:`, advisorData);

        insertedRecord = await prisma.advisor.create({ data: advisorData });
        insertedId = insertedRecord.id;
        console.log(`[DEBUG] Prisma create response:`, insertedRecord);

        // Try sending email, catch so it doesn't break insertion
        try {
          await EmailService.sendWelcomeEmail({
            to: application.email,
            applicantName: application.fullName,
            role: "Advisory Board Member",
            applicationNumber: application.applicationNumber ?? undefined,
          });
        } catch (e) {
          console.log("[DEBUG] Email send failed (Advisory), but proceeding.", e);
        }
      } else if (application.applicationType === "ACCREDITATION") {
        mappedTable = "Organization";
        const accDate = new Date();
        const expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + 5);

        const orgData = {
          organizationName: application.company ?? application.fullName,
          registrationNumber: application.registrationNumber ?? `AUTO-${Date.now()}`,
          country: application.country ?? "N/A",
          countryCode: (application as any).countryCode,
          phoneCode: (application as any).phoneCode,
          state: (application as any).state,
          city: (application as any).city,
          postalCode: (application as any).postalCode,
          addressLine1: (application as any).addressLine1,
          addressLine2: (application as any).addressLine2,
          address: application.address ?? "N/A", // Fixed from country to address
          email: application.email,
          phone: application.phone ?? "N/A",
          website: application.website ?? null,
          accreditationStatus: "ACTIVE" as const,
          accreditationDate: accDate,
          expiryDate: expDate,
        };
        console.log(`[DEBUG] Mapped table: ${mappedTable}`);
        console.log(`[DEBUG] Data before insertion:`, orgData);

        insertedRecord = await prisma.organization.create({ data: orgData });
        insertedId = insertedRecord.id;
        console.log(`[DEBUG] Prisma create response:`, insertedRecord);

        try {
          await EmailService.sendApprovalEmail({
            to: application.email,
            applicantName: application.fullName,
            applicationType: typeLabel,
            applicationNumber: application.applicationNumber ?? undefined,
          });
        } catch (e) {
          console.log("[DEBUG] Email send failed (Accreditation), but proceeding.", e);
        }
      } else if (application.applicationType === "AUDITOR") {
        mappedTable = "Auditor";
        // Auto-create Auditor profile (linked to first available org for now)
        let org = await prisma.organization.findFirst({
          where: { deletedAt: null, accreditationStatus: "ACTIVE" },
        });

        // Fallback: create a system default org if none exist, because organizationId is required.
        if (!org) {
           org = await prisma.organization.create({
             data: {
               organizationName: "System Default Organization",
               registrationNumber: `DEFAULT-ORG-${Date.now()}`,
               country: "System",
               address: "System",
               email: "admin@iucb.org",
               phone: "N/A",
               accreditationStatus: "ACTIVE",
               accreditationDate: new Date(),
               expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
             }
           });
           console.log("[DEBUG] Created System Default Organization since no active orgs were found.");
        }

        const auditorData = {
          fullName: application.fullName,
          email: application.email,
          phone: application.phone ?? "N/A",
          organizationId: org.id,
          tier: "ASSOCIATE" as const,
          specialization: application.appliedStandard ?? "General",
          experienceYears: application.experienceYears ?? 0,
          status: "ACTIVE",
          country: application.country ?? null,
          countryCode: application.countryCode ?? null,
          phoneCode: application.phoneCode ?? null,
          state: application.state ?? null,
          city: application.city ?? null,
          postalCode: application.postalCode ?? null,
          addressLine1: application.addressLine1 ?? null,
          addressLine2: application.addressLine2 ?? null,
          address: application.address ?? null,
        };
        console.log(`[DEBUG] Mapped table: ${mappedTable}`);
        console.log(`[DEBUG] Data before insertion:`, auditorData);

        insertedRecord = await prisma.auditor.create({ data: auditorData });
        insertedId = insertedRecord.id;
        console.log(`[DEBUG] Prisma create response:`, insertedRecord);

        try {
          await EmailService.sendWelcomeEmail({
            to: application.email,
            applicantName: application.fullName,
            role: "IUCB Certified Auditor",
          });
        } catch (e) {
          console.log("[DEBUG] Email send failed (Auditor), but proceeding.", e);
        }
      } else if (application.applicationType === "TRAINING_INSTITUTE") {
        mappedTable = "TrainingInstitute";
        const trnData = {
          instituteName: application.company ?? application.fullName,
          registrationNumber: application.registrationNumber ?? `TRN-AUTO-${Date.now()}`,
          country: application.country ?? "N/A",
          countryCode: (application as any).countryCode,
          phoneCode: (application as any).phoneCode,
          state: (application as any).state,
          city: (application as any).city,
          postalCode: (application as any).postalCode,
          addressLine1: (application as any).addressLine1,
          addressLine2: (application as any).addressLine2,
          address: application.address ?? "N/A", // Fixed from country to address
          email: application.email,
          phone: application.phone ?? "N/A",
          website: application.website ?? null,
          status: "ACTIVE" as const,
        };
        console.log(`[DEBUG] Mapped table: ${mappedTable}`);
        console.log(`[DEBUG] Data before insertion:`, trnData);

        insertedRecord = await prisma.trainingInstitute.create({ data: trnData });
        insertedId = insertedRecord.id;
        console.log(`[DEBUG] Prisma create response:`, insertedRecord);

        try {
          await EmailService.sendApprovalEmail({
            to: application.email,
            applicantName: application.fullName,
            applicationType: typeLabel,
            applicationNumber: application.applicationNumber ?? undefined,
          });
        } catch (e) {
          console.log("[DEBUG] Email send failed (Training Institute), but proceeding.", e);
        }
      }

      console.log(`[DEBUG] Database commit successful for table ${mappedTable}, Inserted ID: ${insertedId}`);
      
      // Verify Fetch
      if (mappedTable === "Advisor") {
         const fetchResult = await prisma.advisor.findUnique({ where: { id: insertedId } });
         console.log(`[DEBUG] Fetch result from Advisor table:`, fetchResult ? "SUCCESS" : "FAILED");
      } else if (mappedTable === "Organization") {
         const fetchResult = await prisma.organization.findUnique({ where: { id: insertedId } });
         console.log(`[DEBUG] Fetch result from Organization table:`, fetchResult ? "SUCCESS" : "FAILED");
      } else if (mappedTable === "Auditor") {
         const fetchResult = await prisma.auditor.findUnique({ where: { id: insertedId } });
         console.log(`[DEBUG] Fetch result from Auditor table:`, fetchResult ? "SUCCESS" : "FAILED");
      } else if (mappedTable === "TrainingInstitute") {
         const fetchResult = await prisma.trainingInstitute.findUnique({ where: { id: insertedId } });
         console.log(`[DEBUG] Fetch result from TrainingInstitute table:`, fetchResult ? "SUCCESS" : "FAILED");
      }

    } catch (error: any) {
      console.error(`[DEBUG] INSERTION FAILING! Exact reason:`, error);
      throw new ApiError(500, `Failed to create target record in ${mappedTable}: ${error.message}`);
    }

    // Now update application status since insertion succeeded
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        applicationStatus: "APPROVED",
        internalNotes: body.remarks ?? application.internalNotes,
        reviewedById: req.admin.id,
        reviewedAt: new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: req.admin.id,
        entityType: "APPLICATION",
        entityId: application.id,
        action: "APPROVE",
        oldData: { applicationStatus: "PENDING" },
        newData: { applicationStatus: "APPROVED", mappedTable, insertedId },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    const orgName = application.company || application.fullName;
    let notifyMessage = `Application ${application.applicationNumber} has been approved.`;
    if (application.applicationType === "ACCREDITATION") {
      notifyMessage = `Organization application for ${orgName} has been approved.`;
    } else if (application.applicationType === "AUDITOR") {
      notifyMessage = `Auditor ${application.fullName} has been approved.`;
    } else if (application.applicationType === "TRAINING_INSTITUTE") {
      notifyMessage = `Training Institute ${orgName} has been approved.`;
    } else if (application.applicationType === "ADVISORY") {
      notifyMessage = `Advisory Board application for ${application.fullName} has been approved.`;
    }


    res.status(200).json(
      new ApiResponse(200, { application: updatedApplication, insertedRecord, mappedTable }, "Application approved successfully"),
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
