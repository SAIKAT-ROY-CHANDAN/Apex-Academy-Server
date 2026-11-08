import { Router } from 'express';
import { WebsiteFooterBrandingController } from './websiteFooterBranding.controller';
import validation from '../../middlewares/validation';
import { WebsiteFooterBrandingValidation } from './websiteFooterBranding.validation';
import auth from '../../middlewares/auth';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  upload.fields([
    { name: 'footer_image', maxCount: 1 },
    { name: 'branding_image', maxCount: 1 },
  ]),
  processUploads,
  validation(WebsiteFooterBrandingValidation.createWebsiteFooterBrandingValidation),
  WebsiteFooterBrandingController.createWebsiteFooterBranding,
);

router.get(
  '/',
  WebsiteFooterBrandingController.getWebsiteFooterBranding,
);

router.get(
  '/:id',
  auth('administrator'),
  WebsiteFooterBrandingController.getWebsiteFooterBrandingById,
);

router.put(
  '/:id',
  auth('administrator'),
  upload.fields([
    { name: 'footer_image', maxCount: 1 },
    { name: 'branding_image', maxCount: 1 },
  ]),
  processUploads,
  validation(WebsiteFooterBrandingValidation.updateWebsiteFooterBrandingValidation),
  WebsiteFooterBrandingController.updateWebsiteFooterBranding,
);

router.delete(
  '/:id',
  auth('administrator'),
  WebsiteFooterBrandingController.deleteWebsiteFooterBranding,
);

export const WebsiteFooterBrandingRoutes = router;