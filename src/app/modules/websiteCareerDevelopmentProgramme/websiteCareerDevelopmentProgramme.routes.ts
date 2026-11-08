import { Router } from 'express';
import { WebsiteCareerDevelopmentProgrammeController } from './websiteCareerDevelopmentProgramme.controller';
import validation from '../../middlewares/validation';
import { WebsiteCareerDevelopmentProgrammeValidation } from './websiteCareerDevelopmentProgramme.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.careerDevelopmentProgramme.create),
  // The form posts multipart text fields via FormData — parse them.
  upload.none(),
  processUploads,
  validation(
    WebsiteCareerDevelopmentProgrammeValidation.createWebsiteCareerDevelopmentProgrammeValidation,
  ),
  WebsiteCareerDevelopmentProgrammeController.createWebsiteCareerDevelopmentProgramme,
);

// Public list — the website frontend renders it too. Supports
// page/limit/searchTerm via the query builder.
router.get(
  '/',
  WebsiteCareerDevelopmentProgrammeController.getAllWebsiteCareerDevelopmentProgrammes,
);

// Public detail — the website frontend uses it for the Apply form page.
router.get(
  '/:id',
  WebsiteCareerDevelopmentProgrammeController.getWebsiteCareerDevelopmentProgrammeById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.careerDevelopmentProgramme.edit),
  // The form posts multipart text fields via FormData — parse them.
  upload.none(),
  processUploads,
  validation(
    WebsiteCareerDevelopmentProgrammeValidation.updateWebsiteCareerDevelopmentProgrammeValidation,
  ),
  WebsiteCareerDevelopmentProgrammeController.updateWebsiteCareerDevelopmentProgramme,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.careerDevelopmentProgramme.delete),
  WebsiteCareerDevelopmentProgrammeController.deleteWebsiteCareerDevelopmentProgramme,
);

export const WebsiteCareerDevelopmentProgrammeRoutes = router;