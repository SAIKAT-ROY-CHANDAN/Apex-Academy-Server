import { Router } from 'express';
import { WebsiteContactUsController } from './websiteContactUs.controller';
import validation from '../../middlewares/validation';
import { WebsiteContactUsValidation } from './websiteContactUs.validation';
import auth from '../../middlewares/auth';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  validation(WebsiteContactUsValidation.createWebsiteContactUsValidation),
  WebsiteContactUsController.createWebsiteContactUs,
);

router.get('/', WebsiteContactUsController.getWebsiteContactUs);

router.get(
  '/:id',
  auth('administrator'),
  WebsiteContactUsController.getWebsiteContactUsById,
);

router.put(
  '/:id',
  auth('administrator'),
  validation(WebsiteContactUsValidation.updateWebsiteContactUsValidation),
  WebsiteContactUsController.updateWebsiteContactUs,
);

router.delete(
  '/:id',
  auth('administrator'),
  WebsiteContactUsController.deleteWebsiteContactUs,
);

export const WebsiteContactUsRoutes = router;
