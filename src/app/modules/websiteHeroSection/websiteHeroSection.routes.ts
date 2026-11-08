import { Router } from 'express';
import { WebsiteHeroSectionController } from './websiteHeroSection.controller';
import validation from '../../middlewares/validation';
import { WebsiteHeroSectionValidation } from './websiteHeroSection.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.heroSection.create),
  upload.fields([{ name: 'hero_image', maxCount: 1 }]),
  processUploads,
  validation(WebsiteHeroSectionValidation.createWebsiteHeroSectionValidation),
  WebsiteHeroSectionController.createWebsiteHeroSection,
);

router.get(
  '/',
  WebsiteHeroSectionController.getWebsiteHeroSection,
);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.heroSection.view),
  WebsiteHeroSectionController.getWebsiteHeroSectionById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.heroSection.edit),
  upload.fields([{ name: 'hero_image', maxCount: 1 }]),
  processUploads,
  validation(WebsiteHeroSectionValidation.updateWebsiteHeroSectionValidation),
  WebsiteHeroSectionController.updateWebsiteHeroSection,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.heroSection.delete),
  WebsiteHeroSectionController.deleteWebsiteHeroSection,
);

export const WebsiteHeroSectionRoutes = router;
