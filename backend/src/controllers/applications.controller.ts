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

    let emailType = "";
    let emailPayload: any = null;

    const result = await prisma.$transaction(async (tx) => {
      const application = await tx.application.findFirst({
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
            country: application.country ?? "N/A",
            countryCode: application.countryCode,
            phoneCode: application.phoneCode,
            state: application.state,
            city: application.city,
            postalCode: application.postalCode,
            addressLine1: application.addressLine1,
            addressLine2: application.addressLine2,
            address: application.address ?? "N/A",
            status: "ACTIVE" as const,
          };
          
          insertedRecord = await tx.advisor.create({ data: advisorData });
          
          emailType = "WELCOME_ADVISORY";
          emailPayload = {
            to: application.email,
            applicantName: application.fullName,
            role: "Advisory Board Member",
            applicationNumber: application.applicationNumber ?? undefined,
          };
        } else if (application.applicationType === "ACCREDITATION") {
          mappedTable = "Organization";
          const accDate = new Date();
          const expDate = new Date();
          expDate.setFullYear(expDate.getFullYear() + 5);

          const registrationNum = application.registrationNumber ?? `AUTO-${Date.now()}`;
          
          let org = await tx.organization.findUnique({
            where: { registrationNumber: registrationNum }
          });

          if (!org) {
            const orgData = {
              organizationName: application.company ?? application.fullName,
              registrationNumber: registrationNum,
              country: application.country ?? "N/A",
              countryCode: application.countryCode,
              phoneCode: application.phoneCode,
              state: application.state,
              city: application.city,
              postalCode: application.postalCode,
              addressLine1: application.addressLine1,
              addressLine2: application.addressLine2,
              address: application.address ?? "N/A",
              email: application.email,
              phone: application.phone ?? "N/A",
              website: application.website ?? null,
              accreditationStatus: "ACTIVE" as const,
              accreditationDate: accDate,
              expiryDate: expDate,
            };
            org = await tx.organization.create({ data: orgData });
          }
          
          insertedRecord = org;

          emailType = "APPROVAL_ACCREDITATION";
          emailPayload = {
            to: application.email,
            applicantName: application.fullName,
            applicationType: typeLabel,
            applicationNumber: application.applicationNumber ?? undefined,
          };
        } else if (application.applicationType === "AUDITOR") {
          mappedTable = "Auditor";
          let org = await tx.organization.findFirst({
            where: { deletedAt: null, accreditationStatus: "ACTIVE" },
          });

          if (!org) {
             org = await tx.organization.create({
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
          }

          const auditorData = {
            fullName: application.fullName,
            email: application.email,
            phone: application.phone ?? "N/A",
            organizationId: org.id,
            tier: "ASSOCIATE" as const,
            specialization: application.appliedStandard ?? "General",
            experienceYears: application.experienceYears ?? 0,
            country: application.country ?? "N/A",
            countryCode: application.countryCode,
            phoneCode: application.phoneCode,
            state: application.state,
            city: application.city,
            postalCode: application.postalCode,
            addressLine1: application.addressLine1,
            addressLine2: application.addressLine2,
            address: application.address ?? "N/A",
            status: "ACTIVE",
          };
          
          insertedRecord = await tx.auditor.create({ data: auditorData });

          emailType = "WELCOME_AUDITOR";
          emailPayload = {
            to: application.email,
            applicantName: application.fullName,
            role: "IUCB Certified Auditor",
          };
        } else if (application.applicationType === "TRAINING_INSTITUTE") {
          mappedTable = "TrainingInstitute";
          const registrationNum = application.registrationNumber ?? `TRN-AUTO-${Date.now()}`;
          
          let trn = await tx.trainingInstitute.findUnique({
            where: { registrationNumber: registrationNum }
          });

          if (!trn) {
            const trnData = {
              instituteName: application.company ?? application.fullName,
              registrationNumber: registrationNum,
              country: application.country ?? "N/A",
              countryCode: application.countryCode,
              phoneCode: application.phoneCode,
              state: application.state,
              city: application.city,
              postalCode: application.postalCode,
              addressLine1: application.addressLine1,
              addressLine2: application.addressLine2,
              address: application.address ?? "N/A",
              email: application.email,
              phone: application.phone ?? "N/A",
              website: application.website ?? null,
              status: "ACTIVE" as const,
            };
            trn = await tx.trainingInstitute.create({ data: trnData });
          }
          
          insertedRecord = trn;

          emailType = "APPROVAL_TRAINING_INSTITUTE";
          emailPayload = {
            to: application.email,
            applicantName: application.fullName,
            applicationType: typeLabel,
            applicationNumber: application.applicationNumber ?? undefined,
          };
        }
        
        insertedId = insertedRecord.id;
      } catch (error: any) {
        throw new ApiError(500, `Failed to create target record in ${mappedTable}: ${error.message}`);
      }

      const updatedApplication = await tx.application.update({
        where: { id },
        data: {
          applicationStatus: "APPROVED",
          internalNotes: body.remarks ?? application.internalNotes,
          reviewedById: req.admin!.id,
          reviewedAt: new Date(),
        },
      });

      await tx.auditLog.create({
        data: {
          adminId: req.admin!.id,
          entityType: "APPLICATION",
          entityId: application.id,
          action: "APPROVE",
          oldData: { applicationStatus: "PENDING" },
          newData: { applicationStatus: "APPROVED", mappedTable, insertedId },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      return { updatedApplication, insertedRecord, mappedTable };
    });

    // NOW send email outside of the transaction block
    if (emailType && emailPayload) {
      try {
        if (emailType === "WELCOME_ADVISORY" || emailType === "WELCOME_AUDITOR") {
          await EmailService.sendWelcomeEmail(emailPayload);
        } else if (emailType === "APPROVAL_ACCREDITATION" || emailType === "APPROVAL_TRAINING_INSTITUTE") {
          await EmailService.sendApprovalEmail(emailPayload);
        }
      } catch (e) {
        console.error(`[DEBUG] Email send failed for type ${emailType}, but proceeding.`, e);
      }
    }

    res.status(200).json(
      new ApiResponse(200, { application: result.updatedApplication, insertedRecord: result.insertedRecord, mappedTable: result.mappedTable }, "Application approved successfully"),
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
