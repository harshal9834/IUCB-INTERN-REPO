import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AdminRole } from '@prisma/client';
import { CertificateTemplateController } from '../controllers/certificate-template.controller.js';
import { protect, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Ensure storage directory exists at startup
const storageDir = path.join(process.cwd(), 'storage', 'certificate-templates');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, storageDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// All routes require admin authentication
router.use(protect);
router.use(requireRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]));

router.get('/', CertificateTemplateController.listTemplates);
router.post('/analyze', upload.single('htmlFile'), CertificateTemplateController.analyzeTemplate);
router.post('/', upload.single('htmlFile'), CertificateTemplateController.uploadTemplate);
router.put('/:id/status/activate', CertificateTemplateController.activateTemplate);
router.put('/:id/status/archive', CertificateTemplateController.archiveTemplate);
router.delete('/:id', CertificateTemplateController.deleteTemplate);
router.get('/:id/download', CertificateTemplateController.downloadOriginalHtml);

export default router;
