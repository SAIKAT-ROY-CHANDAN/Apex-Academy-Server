import { Router } from 'express';
import { WebsiteCtaBannerController } from './websiteCtaBanner.controller';
import validation from '../../middlewares/validation';
import { WebsiteCtaBannerValidation } from './websiteCtaBanner.validation';
import auth from '../../middlewares/auth';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  upload.fields([{ name: 'cta_image', maxCount: 1 }]),
  processUploads,
  validation(WebsiteCtaBannerValidation.createWebsiteCtaBannerValidation),
  WebsiteCtaBannerController.createWebsiteCtaBanner,
);

router.get('/', WebsiteCtaBannerController.getWebsiteCtaBanner);

router.get(
  '/:id',
  auth('administrator'),
  WebsiteCtaBannerController.getWebsiteCtaBannerById,
);

router.put(
  '/:id',
  auth('administrator'),
  upload.fields([{ name: 'cta_image', maxCount: 1 }]),
  processUploads,
  validation(WebsiteCtaBannerValidation.updateWebsiteCtaBannerValidation),
  WebsiteCtaBannerController.updateWebsiteCtaBanner,
);

router.delete(
  '/:id',
  auth('administrator'),
  WebsiteCtaBannerController.deleteWebsiteCtaBanner,
);

export const WebsiteCtaBannerRoutes = router;
