import { Router } from 'express';
import { WebsiteDepartmentController } from './websiteDepartment.controller';
import validation from '../../middlewares/validation';
import { WebsiteDepartmentValidation } from './websiteDepartment.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';
import parseFormData from '../../middlewares/parseFormData';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.department.create),
  upload.fields([{ name: 'department_image', maxCount: 1 }]),
  processUploads,
  // courseList travels as a stringified JSON array inside multipart.
  parseFormData(['courseList']),
  validation(WebsiteDepartmentValidation.createWebsiteDepartmentValidation),
  WebsiteDepartmentController.createWebsiteDepartment,
);

// Public list — the website frontend renders it too. Supports
// page/limit/searchTerm via the query builder.
router.get(
  '/',
  WebsiteDepartmentController.getAllWebsiteDepartments,
);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.department.view),
  WebsiteDepartmentController.getWebsiteDepartmentById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.department.edit),
  upload.fields([{ name: 'department_image', maxCount: 1 }]),
  processUploads,
  // courseList travels as a stringified JSON array inside multipart.
  parseFormData(['courseList']),
  validation(WebsiteDepartmentValidation.updateWebsiteDepartmentValidation),
  WebsiteDepartmentController.updateWebsiteDepartment,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.department.delete),
  WebsiteDepartmentController.deleteWebsiteDepartment,
);

export const WebsiteDepartmentRoutes = router;
