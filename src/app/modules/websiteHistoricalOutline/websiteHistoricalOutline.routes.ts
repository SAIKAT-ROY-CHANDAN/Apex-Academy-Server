import { Router } from 'express';
import { WebsiteHistoricalOutlineController } from './websiteHistoricalOutline.controller';
import validation from '../../middlewares/validation';
import { WebsiteHistoricalOutlineValidation } from './websiteHistoricalOutline.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

const OUTLINE_UPLOAD_FIELDS = [
  { name: 'outline_image_1', maxCount: 1 },
  { name: 'outline_image_2', maxCount: 1 },
  { name: 'outline_image_3', maxCount: 1 },
];

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.historicalOutline.create),
  upload.fields(OUTLINE_UPLOAD_FIELDS),
  processUploads,
  validation(
    WebsiteHistoricalOutlineValidation.createWebsiteHistoricalOutlineValidation,
  ),
  WebsiteHistoricalOutlineController.createWebsiteHistoricalOutline,
);

router.get(
  '/',
  WebsiteHistoricalOutlineController.getWebsiteHistoricalOutline,
);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.historicalOutline.view),
  WebsiteHistoricalOutlineController.getWebsiteHistoricalOutlineById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.historicalOutline.edit),
  upload.fields(OUTLINE_UPLOAD_FIELDS),
  processUploads,
  validation(
    WebsiteHistoricalOutlineValidation.updateWebsiteHistoricalOutlineValidation,
  ),
  WebsiteHistoricalOutlineController.updateWebsiteHistoricalOutline,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.historicalOutline.delete),
  WebsiteHistoricalOutlineController.deleteWebsiteHistoricalOutline,
);

export const WebsiteHistoricalOutlineRoutes = router;
