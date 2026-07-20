import { Request, Response } from "express";
import prisma from "../config/Database.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  trainingInstituteQuerySchema,
} from "../validators/training-institutes.validators.js";

export class TrainingInstitutesController {
  // GET /api/v1/training-institutes
  getTrainingInstitutes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = trainingInstituteQuerySchema.parse(req.query);
    const { page, limit, status, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { instituteName: { contains: search, mode: "insensitive" } },
        { registrationNumber: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ];
    }
    if (query.country) where.country = query.country;
    if (query.state) where.state = query.state;
    if (query.city) where.city = query.city;

    const [trainingInstitutes, total] = await Promise.all([
      prisma.trainingInstitute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.trainingInstitute.count({ where }),
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          trainingInstitutes,
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        },
        "Training institutes fetched successfully",
      ),
    );
  });

  // GET /api/v1/training-institutes/:id
  getTrainingInstituteById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);

    const trainingInstitute = await prisma.trainingInstitute.findFirst({
      where: { id, deletedAt: null },
    });

    if (!trainingInstitute) throw new ApiError(404, "Training Institute not found");

    res.status(200).json(
      new ApiResponse(200, { trainingInstitute }, "Training Institute fetched successfully"),
    );
  });

  // PATCH /api/v1/training-institutes/:id/status
  updateTrainingInstituteStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = String(req.params.id);
      const { status } = req.body;

      if (!req.admin) throw new ApiError(401, "Not authenticated");
      if (!["ACTIVE", "SUSPENDED", "REVOKED"].includes(status)) {
        throw new ApiError(400, "Invalid status");
      }

      const trainingInstitute = await prisma.trainingInstitute.findFirst({
        where: { id, deletedAt: null },
      });
      if (!trainingInstitute) throw new ApiError(404, "Training Institute not found");

      const oldStatus = trainingInstitute.status;
      const updated = await prisma.trainingInstitute.update({
        where: { id },
        data: { status },
      });

      await prisma.auditLog.create({
        data: {
          adminId: req.admin.id,
          entityType: "TRAINING_INSTITUTE",
          entityId: id,
          action: "STATUS_CHANGE",
          oldData: { status: oldStatus },
          newData: { status },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      res.status(200).json(
        new ApiResponse(200, { trainingInstitute: updated }, "Training Institute status updated"),
      );
    },
  );

  // DELETE /api/v1/training-institutes/:id (soft delete)
  deleteTrainingInstitute = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = String(req.params.id);

      if (!req.admin) throw new ApiError(401, "Not authenticated");

      const trainingInstitute = await prisma.trainingInstitute.findFirst({
        where: { id, deletedAt: null },
      });
      if (!trainingInstitute) throw new ApiError(404, "Training Institute not found");

      const deleted = await prisma.trainingInstitute.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await prisma.auditLog.create({
        data: {
          adminId: req.admin.id,
          entityType: "TRAINING_INSTITUTE",
          entityId: id,
          action: "DELETE",
          oldData: trainingInstitute,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        },
      });

      res.status(200).json(
        new ApiResponse(200, { trainingInstitute: deleted }, "Training Institute deleted"),
      );
    },
  );

  // PUT /api/v1/training-institutes/:id
  updateTrainingInstitute = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const id = String(req.params.id);
    const { updateTrainingInstituteSchema } = await import("../validators/training-institutes.validators.js");
    const body = updateTrainingInstituteSchema.parse(req.body);

    const existing = await prisma.trainingInstitute.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new ApiError(404, "Training Institute not found");

    const trainingInstitute = await prisma.trainingInstitute.update({ where: { id }, data: body });

    res.status(200).json(new ApiResponse(200, { trainingInstitute }, "Training Institute updated successfully"));
  });

  // GET /api/v1/training-institutes/:id/audit-logs
  getTrainingInstituteAuditLogs = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = String(req.params.id);

      const auditLogs = await prisma.auditLog.findMany({
        where: {
          entityType: "TRAINING_INSTITUTE",
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
}

export default TrainingInstitutesController;
