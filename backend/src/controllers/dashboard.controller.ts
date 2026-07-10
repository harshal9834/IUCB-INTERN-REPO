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
      prisma.application.count({ where: { deletedAt: null, applicationStatus: "PENDING" } }),
      prisma.application.count({ where: { deletedAt: null, applicationStatus: "APPROVED" } }),
      prisma.advisor.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.news.count({ where: { deletedAt: null } }),
    ]);

    // Training Institutes - not in current Prisma client model props, return 0
    const totalTrainingInstitutes = 0;
    const activeTrainingInstitutes = 0;
    const suspendedTrainingInstitutes = 0;
    const revokedTrainingInstitutes = 0;

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
          trainingInstitutes: {
            total: totalTrainingInstitutes,
            active: activeTrainingInstitutes,
            suspended: suspendedTrainingInstitutes,
            revoked: revokedTrainingInstitutes,
          },
        },
        "Dashboard metrics fetched successfully",
      ),
    );
  });

  getOverview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Parallelize all count queries and recent data fetching
    const [
      // Organizations
      totalOrganizations,
      activeOrganizations,
      inactiveOrganizations,
      // Applications
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      // Auditors
      totalAuditors,
      activeAuditors,
      suspendedAuditors,
      // Training Institutes (via applications since no dedicated model in client)
      totalTIs,
      activeTIs,
      // Advisors
      totalAdvisors,
      activeAdvisors,
      inactiveAdvisors,
      // Credentials
      pendingCredentials,
      totalGeneratedCredentials,
      validCredentials,
      expiredCredentials,
      revokedCredentials,

      // Recent Lists
      recentPendingAppsList,
      recentPendingCredsList,
      recentApprovalsList,
      recentCredentialsList,
      recentOrganizationsList,
      recentAuditorsList,
    ] = await Promise.all([
      // Organizations
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.organization.count({ where: { deletedAt: null, accreditationStatus: "ACTIVE" } }),
      prisma.organization.count({ where: { deletedAt: null, accreditationStatus: { in: ["SUSPENDED", "REVOKED"] } } }),

      // Applications
      prisma.application.count({ where: { deletedAt: null } }),
      prisma.application.count({ where: { deletedAt: null, applicationStatus: "PENDING" } }),
      prisma.application.count({ where: { deletedAt: null, applicationStatus: "APPROVED" } }),
      prisma.application.count({ where: { deletedAt: null, applicationStatus: "REJECTED" } }),

      // Auditors
      prisma.auditor.count({ where: { deletedAt: null } }),
      prisma.auditor.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.auditor.count({ where: { deletedAt: null, status: "SUSPENDED" } }),

      // Training Institutes (via applications)
      prisma.application.count({ where: { deletedAt: null, applicationType: "TRAINING_INSTITUTE" } }),
      prisma.application.count({ where: { deletedAt: null, applicationType: "TRAINING_INSTITUTE", applicationStatus: "APPROVED" } }),

      // Advisors
      prisma.advisor.count({ where: { deletedAt: null } }),
      prisma.advisor.count({ where: { deletedAt: null, status: "ACTIVE" } }),
      prisma.advisor.count({ where: { deletedAt: null, status: "INACTIVE" } }),

      // Credentials
      prisma.application.count({ where: { deletedAt: null, applicationStatus: "APPROVED", credentialGenerated: false } }),
      prisma.credential.count({ where: { deletedAt: null } }),
      prisma.credential.count({ where: { deletedAt: null, status: "VALID" } }),
      prisma.credential.count({ where: { deletedAt: null, status: "EXPIRED" } }),
      prisma.credential.count({ where: { deletedAt: null, status: "REVOKED" } }),

      // Lists (Limit 5)
      prisma.application.findMany({
        where: { deletedAt: null, applicationStatus: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, applicationNumber: true, applicationType: true, fullName: true, company: true, createdAt: true }
      }),
      prisma.application.findMany({
        where: { deletedAt: null, applicationStatus: "APPROVED", credentialGenerated: false },
        orderBy: { reviewedAt: "desc" },
        take: 5,
        select: { id: true, applicationNumber: true, applicationType: true, fullName: true, company: true, reviewedAt: true }
      }),
      prisma.application.findMany({
        where: { deletedAt: null, applicationStatus: "APPROVED" },
        orderBy: { reviewedAt: "desc" },
        take: 5,
        select: { id: true, applicationNumber: true, applicationType: true, fullName: true, company: true, reviewedAt: true, reviewedBy: { select: { fullName: true } } }
      }),
      prisma.credential.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, credentialId: true, standard: true, status: true, issueDate: true, organization: { select: { organizationName: true } }, application: { select: { fullName: true, company: true } } }
      }),
      prisma.organization.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, registrationNumber: true, organizationName: true, country: true, accreditationStatus: true, createdAt: true }
      }),
      prisma.auditor.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, fullName: true, email: true, tier: true, status: true, createdAt: true, organization: { select: { organizationName: true } } }
      })
    ]);

    const pendingOrganizations = await prisma.application.count({ where: { deletedAt: null, applicationType: "ACCREDITATION", applicationStatus: "PENDING" } });
    const inactiveAuditors = totalAuditors - activeAuditors - suspendedAuditors;
    const inactiveTIs = totalTIs - activeTIs;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          organizations: {
            total: totalOrganizations,
            active: activeOrganizations,
            inactive: inactiveOrganizations,
            pending: pendingOrganizations
          },
          applications: {
            total: totalApplications,
            pending: pendingApplications,
            approved: approvedApplications,
            rejected: rejectedApplications
          },
          auditors: {
            total: totalAuditors,
            active: activeAuditors,
            inactive: inactiveAuditors,
            suspended: suspendedAuditors
          },
          trainingInstitutes: {
            total: totalTIs,
            active: activeTIs,
            inactive: inactiveTIs
          },
          advisors: {
            total: totalAdvisors,
            active: activeAdvisors,
            inactive: inactiveAdvisors
          },
          credentials: {
            pending: pendingCredentials,
            generated: totalGeneratedCredentials,
            valid: validCredentials,
            expired: expiredCredentials,
            revoked: revokedCredentials
          },
          lists: {
            pendingApplications: recentPendingAppsList,
            pendingCredentials: recentPendingCredsList,
            recentApprovals: recentApprovalsList,
            recentCredentials: recentCredentialsList,
            recentOrganizations: recentOrganizationsList,
            recentAuditors: recentAuditorsList
          }
        },
        "Dashboard overview fetched successfully",
      ),
    );
  });
}

export default new DashboardController();
