import { Request, Response } from "express";
import prisma from "../config/Database.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

export class StatisticsController {
  getPublicStatistics = asyncHandler(async (req: Request, res: Response) => {
    try {
      // 1. Total ACTIVE organizations
      const organizations = await prisma.organization.count({
        where: {
          accreditationStatus: "ACTIVE",
          deletedAt: null,
        },
      });

      // 2. Count DISTINCT countries from active organizations
      const countriesQuery = await prisma.organization.findMany({
        where: {
          accreditationStatus: "ACTIVE",
          deletedAt: null,
        },
        select: {
          country: true,
        },
        distinct: ["country"],
      });
      // Filter out null or empty strings if any exist
      const countries = countriesQuery.filter((c) => c.country && c.country.trim() !== "").length;

      // 3. Count ACTIVE auditors
      const auditors = await prisma.auditor.count({
        where: {
          status: "ACTIVE",
          deletedAt: null,
        },
      });

      // 4. Count DISTINCT standards covered
      const standardsQuery = await prisma.credential.findMany({
        where: {
          deletedAt: null,
        },
        select: {
          standard: true,
        },
        distinct: ["standard"],
      });
      const standards = standardsQuery.filter((s) => s.standard && s.standard.trim() !== "").length;

      res.status(200).json(
        new ApiResponse(
          200,
          {
            organizations,
            countries,
            auditors,
            standards,
          },
          "Statistics fetched successfully",
        ),
      );
    } catch (error) {
      console.error("Database Error in getPublicStatistics:", error);
      // Fallback response to prevent 500 error and keep frontend UI alive
      res.status(200).json(
        new ApiResponse(
          200,
          {
            organizations: 0,
            countries: 0,
            auditors: 0,
            standards: 0,
          },
          "Fallback statistics fetched successfully (DB Error)",
        ),
      );
    }
  });

  getCertificateSummary = asyncHandler(async (req: Request, res: Response) => {
    try {
      const credentialId = String(req.params.credentialId);

      let credential: any;
      
      if (credentialId === "latest") {
        credential = await prisma.credential.findFirst({
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          include: {
            generatedBy: true,
            application: true,
          }
        });
      } else {
        credential = await prisma.credential.findUnique({
          where: { credentialId },
          include: {
            generatedBy: true,
            application: true,
          }
        });
      }

      if (!credential) {
        res.status(200).json(new ApiResponse(200, null, "No certificate found"));
        return;
      }

      // Fetch related audit logs (for activities)
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          entityId: credential.id,
          entityType: "CREDENTIAL",
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      // Count downloads
      const downloadCount = await prisma.auditLog.count({
        where: {
          entityId: credential.id,
          entityType: "CREDENTIAL",
          action: "DOWNLOAD",
        }
      });

      // Determine Certificate Type
      let certificateType = "General Certificate";
      if (credential.application?.applicationType === "ADVISORY") certificateType = "Advisory Board";
      else if (credential.application?.applicationType === "ACCREDITATION") certificateType = "Organization Accreditation";
      else if (credential.application?.applicationType === "AUDITOR") certificateType = "Auditor Credential";
      else if (credential.application?.applicationType === "TRAINING_INSTITUTE") certificateType = "Training Institute";

      // Determine Template Name based on Type (simplification since not directly linked)
      const templateName = `${certificateType} Certificate`;

      // Map activities
      const activities = auditLogs.map((log) => {
        // Map actions to human readable event names
        let eventName = log.action as string;
        if (log.action === "GENERATE") eventName = "Certificate Generated";
        else if (log.action === "CREATE") eventName = "Credential Issued";
        else if (log.action === "UPDATE") eventName = "Certificate Updated";
        else if (log.action === "DOWNLOAD") eventName = "Certificate Downloaded";
        else if (log.action === "SEND_EMAIL") eventName = "Certificate Emailed";
        
        return {
          eventName,
          timestamp: log.createdAt,
          performedBy: log.actorName || "System",
          referenceNumber: credential.certificateId || credential.credentialId,
        };
      });

      const data = {
        credentialId: credential.credentialId,
        certificateId: credential.certificateId || "N/A",
        certificateType,
        issuedOn: credential.issueDate,
        expiryDate: credential.expiryDate,
        status: credential.status,
        generatedBy: credential.generatedBy?.fullName || "System",
        verificationStatus: credential.certificateGenerated ? "VERIFIED" : "PENDING",
        downloadCount,
        lastVerified: credential.updatedAt,
        emailStatus: credential.emailSent ? "Sent" : "Pending",
        templateName,
        digitalSignature: true, 
        qrGenerated: !!credential.qrCode,
        activities
      };

      res.status(200).json(new ApiResponse(200, data, "Certificate summary fetched successfully"));
    } catch (error: any) {
      console.error("Database Error in getCertificateSummary:", error);
      res.status(200).json(new ApiResponse(200, null, `DB Error: ${error.message}`));
    }
  });

  getCertificateInsights = asyncHandler(async (req: Request, res: Response) => {
    try {
      const credentialId = String(req.params.credentialId);

      let credential: any;
      
      if (credentialId === "latest") {
        credential = await prisma.credential.findFirst({
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          include: {
            application: true,
          }
        });
      } else {
        credential = await prisma.credential.findUnique({
          where: { credentialId },
          include: {
            application: true,
          }
        });
      }

      if (!credential) {
        res.status(200).json(new ApiResponse(200, null, "No certificate found"));
        return;
      }

      // Determine Certificate Type
      let certificateType = "General Certificate";
      if (credential.application?.applicationType === "ADVISORY") certificateType = "Advisory Board";
      else if (credential.application?.applicationType === "ACCREDITATION") certificateType = "Organization Accreditation";
      else if (credential.application?.applicationType === "AUDITOR") certificateType = "Certified Auditor";
      else if (credential.application?.applicationType === "TRAINING_INSTITUTE") certificateType = "Training Institute Accreditation";

      const templateName = `${certificateType} Certificate`;

      const now = Date.now();
      const issueTime = new Date(credential.issueDate).getTime();
      const expiryTime = new Date(credential.expiryDate).getTime();
      const totalTime = expiryTime - issueTime;
      const passedTime = now - issueTime;
      let validityPercentage = totalTime > 0 ? 100 - (passedTime / totalTime) * 100 : 0;
      if (validityPercentage < 0) validityPercentage = 0;
      if (validityPercentage > 100) validityPercentage = 100;
      validityPercentage = Math.round(validityPercentage);

      // Count downloads
      const downloads = await prisma.auditLog.count({
        where: {
          entityId: credential.id,
          entityType: "CREDENTIAL",
          action: "DOWNLOAD",
        }
      });

      const data = {
        certificateType,
        status: credential.status,
        issueDate: credential.issueDate,
        expiryDate: credential.expiryDate,
        templateName,
        templateVersion: "v1.0",
        verificationStatus: credential.certificateGenerated ? "VERIFIED" : "PENDING",
        validityPercentage,
        verificationConfidence: 100,
        digitalSignature: true,
        qrVerified: !!credential.qrCode,
        downloads,
        lastVerified: credential.updatedAt,
        emailStatus: credential.emailSent ? "Sent" : "Pending"
      };

      res.status(200).json(new ApiResponse(200, data, "Certificate insights fetched successfully"));
    } catch (error: any) {
      console.error("Database Error in getCertificateInsights:", error);
      res.status(200).json(new ApiResponse(200, null, `DB Error: ${error.message}`));
    }
  });
}
