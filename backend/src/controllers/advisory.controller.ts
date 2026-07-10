import { Request, Response } from "express";
import prisma from "../config/Database.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

export class AdvisoryController {
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
