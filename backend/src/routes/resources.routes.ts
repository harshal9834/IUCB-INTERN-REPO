import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  getAllResources,
  getPublicResources,
  createResource,
  updateResource,
  deleteResource,
  downloadResource,
} from "../controllers/resources.controller.js";
import { protect, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

const storageDir = path.join(process.cwd(), "storage/resources");

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // We could make subdirectories based on req.body.category if we wanted to
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Public routes
router.get("/public", getPublicResources);
router.get("/download/:id", downloadResource);

// Admin routes
router.use(protect);
router.use(requireRole(["SUPER_ADMIN", "ADMIN"]));

router.get("/", getAllResources);
router.post("/", upload.single("file"), createResource);
router.put("/:id", upload.single("file"), updateResource);
router.delete("/:id", deleteResource);

export default router;
