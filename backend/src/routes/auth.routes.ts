import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { setupAuditContext } from "../middlewares/audit.middleware.js";
import { auditAuthOperations } from "../middlewares/auto-audit.middleware.js";

const router = Router();
const authController = new AuthController();

// Apply audit context to all routes
router.use(setupAuditContext);

// Authentication routes with automatic audit logging
router.post("/login", auditAuthOperations('LOGIN'), authController.login);
router.post("/logout", auditAuthOperations('LOGOUT'), authController.logout);
router.post("/refresh", authController.refresh);
router.post("/forgot-password", auditAuthOperations('PASSWORD_RESET'), authController.forgotPassword);
router.post("/reset-password", auditAuthOperations('PASSWORD_RESET'), authController.resetPassword);

// Protected routes
router.get("/me", protect, authController.me);
router.patch("/change-password", protect, auditAuthOperations('PASSWORD_CHANGE'), authController.changePassword);

export default router;
