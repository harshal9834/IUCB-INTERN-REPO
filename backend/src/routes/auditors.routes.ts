import { Router } from "express";
import { AuditorsController } from "../controllers/auditors.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();
const ctrl = new AuditorsController();

// PRD endpoints
router.get("/", protect, ctrl.getAuditors);

// Extended CRUD
router.post("/", protect, ctrl.createAuditor);
router.get("/:id", protect, ctrl.getAuditorById);
router.put("/:id", protect, ctrl.updateAuditor);
router.delete("/:id", protect, ctrl.deleteAuditor);

export default router;
