import { Router } from "express";
import { PublicApplicationsController, AdminApplicationsController } from "../controllers/applications.controller.js";
import { AdvisoryController } from "../controllers/advisory.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();
const publicCtrl = new PublicApplicationsController();
const adminCtrl = new AdminApplicationsController();
const advisoryCtrl = new AdvisoryController();

// PRD Endpoints
router.post("/apply", publicCtrl.applyAdvisory);                          // public
router.get("/applications", protect, adminCtrl.getApplications);          // admin
router.post("/applications/:id/decision", protect, async (req, res, next) => {
  // Legacy decision endpoint — route to approve/reject based on body.status
  const status = req.body?.status;
  if (status === "APPROVED") {
    return adminCtrl.approveApplication(req as any, res, next);
  } else if (status === "REJECTED") {
    return adminCtrl.rejectApplication(req as any, res, next);
  }
  res.status(400).json({ message: "status must be APPROVED or REJECTED" });
});

// Public list of advisors
router.get("/public/advisors", advisoryCtrl.getPublicAdvisors);

export default router;
