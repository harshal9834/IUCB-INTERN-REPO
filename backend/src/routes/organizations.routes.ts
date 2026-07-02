import { Router } from "express";
import { OrganizationsController } from "../controllers/organizations.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();
const ctrl = new OrganizationsController();

// PRD endpoints
router.get("/", protect, ctrl.getOrganizations);
router.post("/", protect, ctrl.createOrganization);
router.patch("/:id/status", protect, ctrl.updateOrganizationStatus);

// Extended CRUD
router.get("/:id", protect, ctrl.getOrganizationById);
router.put("/:id", protect, ctrl.updateOrganization);
router.delete("/:id", protect, ctrl.deleteOrganization);

export default router;
