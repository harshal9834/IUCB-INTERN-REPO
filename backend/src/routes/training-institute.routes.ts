import { Router } from "express";
import { PublicApplicationsController } from "../controllers/applications.controller.js";

const router = Router();
const ctrl = new PublicApplicationsController();

// POST /api/v1/training-institute/apply  — public
router.post("/apply", ctrl.applyTrainingInstitute);

export default router;
