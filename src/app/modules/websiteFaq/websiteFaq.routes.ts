import { Router } from 'express';
import { WebsiteFaqController } from './websiteFaq.controller';
import validation from '../../middlewares/validation';
import { WebsiteFaqValidation } from './websiteFaq.validation';
import auth from '../../middlewares/auth';

const router = Router();

// Bulk create — must be before /:id so 'bulk' is not treated as an id.
router.post(
  '/bulk',
  auth('administrator'),
  validation(WebsiteFaqValidation.createManyWebsiteFaqValidation),
  WebsiteFaqController.createManyWebsiteFaqs,
);

router.post(
  '/',
  auth('administrator'),
  validation(WebsiteFaqValidation.createWebsiteFaqValidation),
  WebsiteFaqController.createWebsiteFaq,
);

// Public list — website frontend renders FAQs. Supports page/limit/searchTerm.
router.get('/', WebsiteFaqController.getAllWebsiteFaqs);

router.get(
  '/:id',
  auth('administrator'),
  WebsiteFaqController.getWebsiteFaqById,
);

router.put(
  '/:id',
  auth('administrator'),
  validation(WebsiteFaqValidation.updateWebsiteFaqValidation),
  WebsiteFaqController.updateWebsiteFaq,
);

router.delete(
  '/:id',
  auth('administrator'),
  WebsiteFaqController.deleteWebsiteFaq,
);

export const WebsiteFaqRoutes = router;
