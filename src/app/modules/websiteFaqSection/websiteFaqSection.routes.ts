import { Router } from 'express';
import { WebsiteFaqSectionController } from './websiteFaqSection.controller';
import validation from '../../middlewares/validation';
import { WebsiteFaqSectionValidation } from './websiteFaqSection.validation';
import auth from '../../middlewares/auth';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  upload.fields([{ name: 'faq_image', maxCount: 1 }]),
  processUploads,
  validation(WebsiteFaqSectionValidation.createWebsiteFaqSectionValidation),
  WebsiteFaqSectionController.createWebsiteFaqSection,
);

router.get('/', WebsiteFaqSectionController.getWebsiteFaqSection);

router.get(
  '/:id',
  auth('administrator'),
  WebsiteFaqSectionController.getWebsiteFaqSectionById,
);

router.put(
  '/:id',
  auth('administrator'),
  upload.fields([{ name: 'faq_image', maxCount: 1 }]),
  processUploads,
  validation(WebsiteFaqSectionValidation.updateWebsiteFaqSectionValidation),
  WebsiteFaqSectionController.updateWebsiteFaqSection,
);

router.delete(
  '/:id',
  auth('administrator'),
  WebsiteFaqSectionController.deleteWebsiteFaqSection,
);

export const WebsiteFaqSectionRoutes = router;
