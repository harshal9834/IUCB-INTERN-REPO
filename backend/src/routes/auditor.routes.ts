import { Router } from "express";
import { PublicApplicationsController } from "../controllers/applications.controller.js";

const router = Router();
const ctrl = new PublicApplicationsController();

// POST /api/v1/auditor/apply  — public
router.post("/apply", ctrl.applyAuditor);

export default router;
