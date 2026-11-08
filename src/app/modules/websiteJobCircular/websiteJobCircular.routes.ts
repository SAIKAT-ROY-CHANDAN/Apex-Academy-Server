import { Router } from 'express';
import { WebsiteJobCircularController } from './websiteJobCircular.controller';
import validation from '../../middlewares/validation';
import { WebsiteJobCircularValidation } from './websiteJobCircular.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.jobCircular.create),
  upload.fields([{ name: 'job_image', maxCount: 1 }]),
  processUploads,
  validation(WebsiteJobCircularValidation.createWebsiteJobCircularValidation),
  WebsiteJobCircularController.createWebsiteJobCircular,
);

// Public list — the website frontend renders it too. Supports
// page/limit/searchTerm via the query builder.
router.get(
  '/',
  WebsiteJobCircularController.getAllWebsiteJobCirculars,
);

// Public detail — rendered by the public job details & apply pages too.
router.get(
  '/:id',
  WebsiteJobCircularController.getWebsiteJobCircularById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.jobCircular.edit),
  upload.fields([{ name: 'job_image', maxCount: 1 }]),
  processUploads,
  validation(WebsiteJobCircularValidation.updateWebsiteJobCircularValidation),
  WebsiteJobCircularController.updateWebsiteJobCircular,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.jobCircular.delete),
  WebsiteJobCircularController.deleteWebsiteJobCircular,
);

export const WebsiteJobCircularRoutes = router;
