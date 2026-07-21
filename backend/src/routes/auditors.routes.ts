import { Router } from "express";
import { AuditorsController } from "../controllers/auditors.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { setupAuditContext } from "../middlewares/audit.middleware.js";
import { auditAuditors } from "../middlewares/auto-audit.middleware.js";

const router = Router();
const ctrl = new AuditorsController();

// Apply audit context to all routes
router.use(setupAuditContext);

// PRD endpoints
router.get("/", protect, ctrl.getAuditors);

// Extended CRUD with automatic audit logging
router.post("/", protect, auditAuditors, ctrl.createAuditor);
router.get("/:id", protect, ctrl.getAuditorById);
router.put("/:id/status", protect, auditAuditors, ctrl.updateAuditorStatus);
router.patch("/:id/status", protect, auditAuditors, ctrl.updateAuditorStatus);
router.put("/:id", protect, auditAuditors, ctrl.updateAuditor);
router.delete("/:id", protect, auditAuditors, ctrl.deleteAuditor);

export default router;
