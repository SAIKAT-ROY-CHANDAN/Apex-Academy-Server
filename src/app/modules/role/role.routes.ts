import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { roleValidation } from './role.validation';
import { roleController } from './role.controller';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  validation(roleValidation.createRole),
  permission(permissions.administration.role.create),
  roleController.createRole,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.administration.role.view),
  roleController.getAllRoles,
);

router.get(
  '/permissions',
  auth('administrator'),
  roleController.getAllPermissions,
);

router.get(
  '/all-permissions', 
  // auth('administrator'),
  roleController.getPermissions,
);


export const RoleRoute = router;