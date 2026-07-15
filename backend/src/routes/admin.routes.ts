import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";

const router = Router();
const adminController = new AdminController();

router.get("/profile", adminController.getProfile);
router.post("/", adminController.createAdmin);

export default router;
