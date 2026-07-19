import { Router } from "express";
import { heroController } from "../controllers/hero.controller.js";

const router = Router();

// Public routes
router.get("/public/hero-slides", heroController.getPublicHeroSlides);

export default router;
