import { Request, Response } from "express";
import prisma from "../config/Database.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  advisorQuerySchema,
} from "../validators/advisors.validators.js";

export class AdvisorsController {
  // GET /api/v1/advisors (admin list)
  getAdvisors = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = advisorQuerySchema.parse(req.query);
    const { page, limit, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
      ];
    }

    const [advisors, total] = await Promise.all([
      prisma.advisor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { application: true },
      }),
      prisma.advisor.count({ where }),
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          advisors,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
        "Advisors fetched successfully",
      ),
    );
  });

  // GET /api/v1/advisors/:id
  getAdvisorById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);

    const advisor = await prisma.advisor.findFirst({
      where: { id, deletedAt: null },
      include: { application: true },
    });

    if (!advisor) throw new ApiError(404, "Advisor not found");

    res.status(200).json(
      new ApiResponse(200, { advisor }, "Advisor fetched successfully"),
    );
  });

  // PATCH /api/v1/advisors/:id/status
  updateAdvisorStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = String(req.params.id);
      const { status, reason } = req.body;

      if (!req.admin) throw new ApiError(401, "Not authenticated");
      if (!["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) {
        throw new ApiError(400, "Invalid status");
      }

      const advisor = await prisma.advisor.findFirst({
        where: { id, deletedAt: null },
        include: { application: true },
      });
      if (!advisor) throw new ApiError(404, "Advisor not found");

      const oldStatus = advisor.status;
      const updated = await prisma.advisor.update({
        where: { id },
        data: { status },
        include: { application: true },
      });

      await prisma.auditLog.create({
        data: {
          adminId: req.admin.id,
          entityType: "ADVISOR",
          entityId: id,
          action: "STATUS_CHANGE",
          oldData: { status: oldStatus },
          newData: { status, reason },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      // Send automatic notification email if email is present
      const recipientEmail = advisor.application?.email;
      if (recipientEmail) {
        const EmailService = (await import("../services/email.service.js")).EmailService;
        try {
          if (status === "SUSPENDED") {
            await EmailService.sendAdvisorySuspensionEmail({
              to: recipientEmail,
              memberName: advisor.fullName,
              reason,
            });
          } else if (status === "INACTIVE") {
            await EmailService.sendAdvisoryDeactivationEmail({
              to: recipientEmail,
              memberName: advisor.fullName,
              reason,
            });
          } else if (status === "ACTIVE" && oldStatus !== "ACTIVE") {
            await EmailService.sendAdvisoryReactivationEmail({
              to: recipientEmail,
              memberName: advisor.fullName,
            });
          }
        } catch (e) {
          console.error(`[AdvisorsController] Failed to send status change email to ${recipientEmail}:`, e);
        }
      }

      res.status(200).json(
        new ApiResponse(200, { advisor: updated }, "Advisor status updated"),
      );
    },
  );

  // PATCH /api/v1/advisors/:id
  updateAdvisor = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = String(req.params.id);
      const { fullName, organization, designation, expertiseArea, experienceYears, bio, linkedinUrl } = req.body;

      if (!req.admin) throw new ApiError(401, "Not authenticated");

      const advisor = await prisma.advisor.findFirst({
        where: { id, deletedAt: null },
      });
      if (!advisor) throw new ApiError(404, "Advisor not found");

      const updated = await prisma.advisor.update({
        where: { id },
        data: {
          fullName,
          organization,
          designation,
          expertiseArea,
          experienceYears,
          bio,
          linkedinUrl,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: req.admin.id,
          entityType: "ADVISOR",
          entityId: id,
          action: "UPDATE",
          oldData: advisor,
          newData: updated,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      res.status(200).json(
        new ApiResponse(200, { advisor: updated }, "Advisor updated successfully"),
      );
    },
  );

  // GET /api/v1/advisors/:id/audit-logs
  getAdvisorAuditLogs = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = String(req.params.id);

      const auditLogs = await prisma.auditLog.findMany({
        where: {
          entityType: "ADVISOR",
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

      res.status(200).json(
        new ApiResponse(200, { auditLogs }, "Audit logs fetched successfully"),
      );
    },
  );

  // GET /api/v1/advisors/:id/email-logs
  getAdvisorEmailLogs = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = String(req.params.id);

      // Get advisor's linked application email via advisoryApplicationId
      const advisor = await prisma.advisor.findFirst({
        where: { id, deletedAt: null },
      });

      if (!advisor) throw new ApiError(404, "Advisor not found");

      // Try to find the application by advisoryApplicationId
      let recipientEmail = "";
      const appId = (advisor as any).advisoryApplicationId || (advisor as any).applicationId;
      if (appId) {
        const application = await prisma.application.findFirst({
          where: { id: appId },
          select: { email: true },
        });
        recipientEmail = application?.email || "";
      }

      const emailLogs = await prisma.emailLog.findMany({
        where: {
          recipient: recipientEmail,
        },
        orderBy: { sentAt: "desc" },
        take: 10,
      });

      res.status(200).json(
        new ApiResponse(200, { emailLogs }, "Email logs fetched successfully"),
      );
    },
  );

  // POST /api/v1/advisors/:id/send-email
  sendEmail = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = String(req.params.id);
      const { recipient, subject, message } = req.body;

      if (!req.admin) throw new ApiError(401, "Not authenticated");

      const advisor = await prisma.advisor.findFirst({
        where: { id, deletedAt: null },
        include: { application: true },
      });
      if (!advisor) throw new ApiError(404, "Advisor not found");

      const targetEmail = recipient || advisor.application?.email;
      if (!targetEmail || !subject || !message) {
        throw new ApiError(400, "Missing required fields: recipient email, subject, message");
      }

      // Use EmailService to send the email
      const EmailService = (await import("../services/email.service.js")).EmailService;
      await EmailService.sendGenericEmail({
        to: targetEmail,
        subject,
        htmlContent: message,
      });

      await prisma.auditLog.create({
        data: {
          adminId: req.admin.id,
          entityType: "ADVISOR",
          entityId: id,
          action: "SEND_EMAIL",
          newData: { recipient: targetEmail, subject },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      res.status(200).json(
        new ApiResponse(200, {}, "Email sent successfully"),
      );
    },
  );

  // DELETE /api/v1/advisors/:id (soft delete)
  deleteAdvisor = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = String(req.params.id);

      if (!req.admin) throw new ApiError(401, "Not authenticated");

      const advisor = await prisma.advisor.findFirst({
        where: { id, deletedAt: null },
      });
      if (!advisor) throw new ApiError(404, "Advisor not found");

      const deleted = await prisma.advisor.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          adminId: req.admin.id,
          entityType: "ADVISOR",
          entityId: id,
          action: "DELETE",
          oldData: advisor,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      res.status(200).json(
        new ApiResponse(200, { advisor: deleted }, "Advisor deleted"),
      );
    },
  );
}

export default AdvisorsController;
