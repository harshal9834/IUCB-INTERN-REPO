import { Response } from "express";
import prisma from "../config/Database.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";
import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";

export class DashboardController {
  getMetrics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const [
      totalOrganizations,
      activeOrganizations,
      totalAuditors,
      activeAuditors,
      totalCredentials,
      validCredentials,
      pendingApplications,
      approvedApplications,
      totalAdvisors,
      totalResources,
    ] = await Promise.all([
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.organization.count({ where: { deletedAt: null, accreditationStatus: "ACTIVE" } }),
      prisma.auditor.count({ where: { deletedAt: null } }),
      prisma.auditor.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.credential.count({ where: { deletedAt: null } }),
      prisma.credential.count({ where: { deletedAt: null, status: "VALID" } }),
      prisma.advisoryApplication.count({ where: { deletedAt: null, applicationStatus: "PENDING" } }),
      prisma.advisoryApplication.count({ where: { deletedAt: null, applicationStatus: "APPROVED" } }),
      prisma.advisor.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.resource.count({ where: { deletedAt: null } }),
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          organizations: { total: totalOrganizations, active: activeOrganizations },
          auditors: { total: totalAuditors, active: activeAuditors },
          credentials: { total: totalCredentials, valid: validCredentials },
          applications: { pending: pendingApplications, approved: approvedApplications },
          advisors: { total: totalAdvisors },
          resources: { total: totalResources },
        },
        "Dashboard metrics fetched successfully",
      ),
    );
  });
}

export default DashboardController;
