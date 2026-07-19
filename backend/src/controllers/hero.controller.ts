import { Request, Response } from "express";
import prisma from "../config/Database.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/AsyncHandler.js";

export class HeroController {
  getPublicHeroSlides = asyncHandler(async (req: Request, res: Response) => {
    try {
      const slides = await prisma.heroSlide.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          eyebrow: true,
          title: true,
          accent: true,
          body: true,
          ctaLabel: true,
          ctaUrl: true,
        }
      });

      res.status(200).json(new ApiResponse(200, slides, "Hero slides fetched successfully"));
    } catch (error) {
      console.error("Database Error in getPublicHeroSlides:", error);
      res.status(200).json(new ApiResponse(200, [], "Fallback hero slides (DB error)"));
    }
  });
}

export const heroController = new HeroController();
