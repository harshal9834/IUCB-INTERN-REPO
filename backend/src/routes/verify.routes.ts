import { Router } from "express";
import { verifyCertificate, downloadByCredential, viewByCredential } from "../controllers/directory.controller.js";

const router = Router();

// GET /api/v1/verify?credential=IUCB-1783688205285-H2B96PLQ3
// Looks up a credential by credentialId OR certificateId and returns the profile
router.get("/", verifyCertificate);

// GET /api/v1/verify/download?credential=IUCB-...
// Downloads the PDF for a credential looked up by credentialId or certificateId
router.get("/download", downloadByCredential);

// GET /api/v1/verify/view?credential=IUCB-...
// Streams the PDF inline for a credential looked up by credentialId or certificateId
router.get("/view", viewByCredential);

export default router;
