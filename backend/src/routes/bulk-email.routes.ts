import { Router } from 'express';
import multer from 'multer';
import { bulkEmailController } from '../controllers/bulk-email.controller.js';
import { protect, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();

// Store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Protect all bulk email routes
router.use(protect);
// Assuming only SUPER_ADMIN or ADMIN can send bulk emails
router.use(requireRole(['SUPER_ADMIN', 'ADMIN']));

router.post(
  '/upload-excel',
  upload.single('file'),
  bulkEmailController.uploadExcel.bind(bulkEmailController)
);

router.post(
  '/upload-template',
  upload.single('file'),
  bulkEmailController.uploadTemplate.bind(bulkEmailController)
);

router.post(
  '/generate',
  bulkEmailController.generateCampaign.bind(bulkEmailController)
);

router.post(
  '/send',
  bulkEmailController.sendEmails.bind(bulkEmailController)
);

router.get(
  '/report/:campaignDbId',
  bulkEmailController.getReport.bind(bulkEmailController)
);

export default router;
