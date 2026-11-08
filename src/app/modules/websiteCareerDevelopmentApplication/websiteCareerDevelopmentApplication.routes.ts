import { Router } from 'express';
import { WebsiteCareerDevelopmentApplicationController } from './websiteCareerDevelopmentApplication.controller';
import validation from '../../middlewares/validation';
import { WebsiteCareerDevelopmentApplicationValidation } from './websiteCareerDevelopmentApplication.validation';
import auth from '../../middlewares/auth';

const router = Router();

// Public — the student facilities "Apply" form posts here.
router.post(
  '/',
  validation(
    WebsiteCareerDevelopmentApplicationValidation.createWebsiteCareerDevelopmentApplicationValidation,
  ),
  WebsiteCareerDevelopmentApplicationController.createWebsiteCareerDevelopmentApplication,
);

router.get(
  '/',
  auth('administrator'),
  WebsiteCareerDevelopmentApplicationController.getAllWebsiteCareerDevelopmentApplications,
);

router.get(
  '/programme/:programmeId',
  auth('administrator'),
  WebsiteCareerDevelopmentApplicationController.getWebsiteCareerDevelopmentApplicationsByProgramme,
);

router.get(
  '/:id',
  auth('administrator'),
  WebsiteCareerDevelopmentApplicationController.getWebsiteCareerDevelopmentApplicationById,
);

router.delete(
  '/:id',
  auth('administrator'),
  WebsiteCareerDevelopmentApplicationController.deleteWebsiteCareerDevelopmentApplication,
);

export const WebsiteCareerDevelopmentApplicationRoutes = router;