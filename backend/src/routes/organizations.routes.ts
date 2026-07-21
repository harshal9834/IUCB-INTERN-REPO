import { Router } from "express";
import { OrganizationsController } from "../controllers/organizations.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { setupAuditContext } from "../middlewares/audit.middleware.js";
import { auditOrganizations } from "../middlewares/auto-audit.middleware.js";

const router = Router();
const ctrl = new OrganizationsController();

// Apply audit context to all routes
router.use(setupAuditContext);

// PRD endpoints with automatic audit logging
router.get("/", protect, ctrl.getOrganizations);
router.post("/", protect, auditOrganizations, ctrl.createOrganization);
router.patch("/:id/status", protect, auditOrganizations, ctrl.updateOrganizationStatus);
router.put("/:id/status", protect, auditOrganizations, ctrl.updateOrganizationStatus);

// Extended CRUD with automatic audit logging  
router.get("/:id", protect, ctrl.getOrganizationById);
router.put("/:id", protect, auditOrganizations, ctrl.updateOrganization);
router.delete("/:id", protect, auditOrganizations, ctrl.deleteOrganization);

export default router;
