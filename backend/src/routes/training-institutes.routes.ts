import { Router } from "express";
import { TrainingInstitutesController } from "../controllers/training-institutes.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { setupAuditContext } from "../middlewares/audit.middleware.js";
import { auditTrainingInstitutes } from "../middlewares/auto-audit.middleware.js";

const router = Router();
const ctrl = new TrainingInstitutesController();

// All routes require authentication
router.use(protect);
router.use(setupAuditContext);

// GET /api/v1/training-institutes
router.get("/", ctrl.getTrainingInstitutes);

// GET /api/v1/training-institutes/:id/audit-logs (must come before /:id to avoid shadowing)
router.get("/:id/audit-logs", ctrl.getTrainingInstituteAuditLogs);

// GET /api/v1/training-institutes/:id
router.get("/:id", ctrl.getTrainingInstituteById);

// PATCH /api/v1/training-institutes/:id/status - Status update with automatic audit logging
router.patch("/:id/status", auditTrainingInstitutes, ctrl.updateTrainingInstituteStatus);

// PUT /api/v1/training-institutes/:id - Update details
router.put("/:id", auditTrainingInstitutes, ctrl.updateTrainingInstitute);

// DELETE /api/v1/training-institutes/:id - Delete with automatic audit logging
router.delete("/:id", auditTrainingInstitutes, ctrl.deleteTrainingInstitute);

export default router;
