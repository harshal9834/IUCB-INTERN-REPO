import { Router } from "express";
import { CredentialsController } from "../controllers/credentials.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();
const ctrl = new CredentialsController();

// PRD endpoints
router.post("/issue", protect, ctrl.issueCredential);

// Extended endpoints
router.get("/", protect, ctrl.getCredentials);
router.get("/:id", protect, ctrl.getCredentialById);
router.post("/:id/revoke", protect, ctrl.revokeCredential);

export default router;
