import { Router } from 'express';
import { WebsiteHeadOfDepartmentController } from './websiteHeadOfDepartment.controller';
import validation from '../../middlewares/validation';
import { WebsiteHeadOfDepartmentValidation } from './websiteHeadOfDepartment.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.headOfDepartment.create),
  upload.fields([{ name: 'hod_image', maxCount: 1 }]),
  processUploads,
  validation(
    WebsiteHeadOfDepartmentValidation.createWebsiteHeadOfDepartmentValidation,
  ),
  WebsiteHeadOfDepartmentController.createWebsiteHeadOfDepartment,
);

// Public list — the website frontend renders it too. Supports
// page/limit/searchTerm via the query builder.
router.get(
  '/',
  WebsiteHeadOfDepartmentController.getAllWebsiteHeadOfDepartments,
);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.headOfDepartment.view),
  WebsiteHeadOfDepartmentController.getWebsiteHeadOfDepartmentById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.headOfDepartment.edit),
  upload.fields([{ name: 'hod_image', maxCount: 1 }]),
  processUploads,
  validation(
    WebsiteHeadOfDepartmentValidation.updateWebsiteHeadOfDepartmentValidation,
  ),
  WebsiteHeadOfDepartmentController.updateWebsiteHeadOfDepartment,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.headOfDepartment.delete),
  WebsiteHeadOfDepartmentController.deleteWebsiteHeadOfDepartment,
);

export const WebsiteHeadOfDepartmentRoutes = router;
