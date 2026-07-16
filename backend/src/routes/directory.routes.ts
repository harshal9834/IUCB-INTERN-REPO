import { Router } from "express";
import {
  searchCertificate,
  getCertificateProfile,
  getCertificateByUuid,
  downloadCertificate,
  viewCertificate,
} from "../controllers/directory.controller.js";

const router = Router();

// POST /api/v1/directory/search
// Body: { certificateId: string }
// Returns: 200 { success: true, uuid } | 404 { success: false, message }
router.post("/search", searchCertificate);

// GET /api/v1/directory/:uuid
// Returns full credential profile by UUID
router.get("/:uuid", getCertificateByUuid);

// GET /api/v1/directory/:uuid/profile
// Returns full credential profile (alias kept for backwards-compat)
router.get("/:uuid/profile", getCertificateProfile);

// GET /api/v1/directory/:uuid/download
// Triggers a file download (Content-Disposition: attachment)
router.get("/:uuid/download", downloadCertificate);

// GET /api/v1/directory/:uuid/view
// Serves the PDF inline in the browser (Content-Disposition: inline)
router.get("/:uuid/view", viewCertificate);

export default router;
