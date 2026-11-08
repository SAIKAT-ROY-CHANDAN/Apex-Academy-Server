import { Router } from 'express';
import { WebsiteCollegeAtGlanceController } from './websiteCollegeAtGlance.controller';
import validation from '../../middlewares/validation';
import { WebsiteCollegeAtGlanceValidation } from './websiteCollegeAtGlance.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

const GLANCE_UPLOAD_FIELDS = [
  { name: 'glance_image_1', maxCount: 1 },
  { name: 'glance_image_2', maxCount: 1 },
  { name: 'glance_image_3', maxCount: 1 },
  { name: 'glance_image_4', maxCount: 1 },
];

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.collegeAtGlance.create),
  upload.fields(GLANCE_UPLOAD_FIELDS),
  processUploads,
  validation(WebsiteCollegeAtGlanceValidation.createWebsiteCollegeAtGlanceValidation),
  WebsiteCollegeAtGlanceController.createWebsiteCollegeAtGlance,
);

router.get(
  '/',
  WebsiteCollegeAtGlanceController.getWebsiteCollegeAtGlance,
);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.collegeAtGlance.view),
  WebsiteCollegeAtGlanceController.getWebsiteCollegeAtGlanceById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.collegeAtGlance.edit),
  upload.fields(GLANCE_UPLOAD_FIELDS),
  processUploads,
  validation(WebsiteCollegeAtGlanceValidation.updateWebsiteCollegeAtGlanceValidation),
  WebsiteCollegeAtGlanceController.updateWebsiteCollegeAtGlance,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.collegeAtGlance.delete),
  WebsiteCollegeAtGlanceController.deleteWebsiteCollegeAtGlance,
);

export const WebsiteCollegeAtGlanceRoutes = router;
