import { Router } from "express";
import { AdvisoryController } from "../controllers/advisory.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();
const ctrl = new AdvisoryController();

// PRD endpoints
router.post("/apply", ctrl.applyForAdvisory);                           // public
router.get("/applications", protect, ctrl.getApplications);
router.post("/applications/:id/decision", protect, ctrl.decideApplication);

export default router;
