import { Router } from 'express';
import { WebsiteGoverningBodyController } from './websiteGoverningBody.controller';
import validation from '../../middlewares/validation';
import { WebsiteGoverningBodyValidation } from './websiteGoverningBody.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.governingBody.create),
  upload.fields([{ name: 'governing_image', maxCount: 1 }]),
  processUploads,
  validation(WebsiteGoverningBodyValidation.createWebsiteGoverningBodyValidation),
  WebsiteGoverningBodyController.createWebsiteGoverningBodyMember,
);

// Public list — the website frontend renders it too. Supports
// page/limit/searchTerm via the query builder.
router.get(
  '/',
  WebsiteGoverningBodyController.getAllWebsiteGoverningBodyMembers,
);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.governingBody.view),
  WebsiteGoverningBodyController.getWebsiteGoverningBodyMemberById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.governingBody.edit),
  upload.fields([{ name: 'governing_image', maxCount: 1 }]),
  processUploads,
  validation(WebsiteGoverningBodyValidation.updateWebsiteGoverningBodyValidation),
  WebsiteGoverningBodyController.updateWebsiteGoverningBodyMember,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.governingBody.delete),
  WebsiteGoverningBodyController.deleteWebsiteGoverningBodyMember,
);

export const WebsiteGoverningBodyRoutes = router;
