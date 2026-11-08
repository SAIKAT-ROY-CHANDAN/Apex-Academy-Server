import { Router } from 'express';
import { AdminAuthController } from './adminAuth.controller';
import validation from '../../middlewares/validation';
import { AdminAuthValidation } from './adminAuth.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/login',
  validation(AdminAuthValidation.loginAdminAuthValidation),
  AdminAuthController.adminAuthLogin,
);

router.post(
  '/register',
  auth('administrator'),
  permission(permissions.administration.administrator.create),
  upload.single('avatar'),
  validation(AdminAuthValidation.createAdminAuthValidation),
  processUploads,
  AdminAuthController.adminAuthRegister,
);

router.post(
  '/setup-institution',
  auth('administrator'),
  validation(AdminAuthValidation.superAdminInstitutionConfigValidation),
  upload.single('logo'),
  processUploads,
  AdminAuthController.addInstitutionConfig,
);

router.get(
  '/institution-config',
  auth(['administrator', 'teacher']),
  AdminAuthController.getInstitutionConfig,
);

router.put(
  '/institution-config',
  auth('administrator'),
  upload.single('logo'),
  processUploads,
  AdminAuthController.updateInstitutionConfig,
);

router.put(
  '/institution-config/:id',
  auth('administrator'),
  upload.single('logo'),
  processUploads,
  AdminAuthController.updateInstitutionConfig,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.administration.administrator.edit),
  upload.single('avatar'),
  processUploads,
  AdminAuthController.updateAdminUser,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.administration.administrator.view),
  AdminAuthController.getAllAdminUsers,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.administration.administrator.view),
  AdminAuthController.getAdminUserById,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.administration.administrator.delete),
  AdminAuthController.deleteAdminUser,
);

export const AdminAuthRoutes = router;
