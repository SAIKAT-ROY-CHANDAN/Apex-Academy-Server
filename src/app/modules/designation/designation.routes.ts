import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { DesignationValidation } from './designation.validation';
import { DesignationController } from './designation.controller';

const router = Router();

router.post(
  '/',
  auth("administrator"),
  permission(permissions.academics.designation.create),
  validation(DesignationValidation.createDesignationValidation),
  DesignationController.createDesignation,
);

router.get(
  '/',
  auth("administrator"),
  permission(permissions.academics.designation.view),
  DesignationController.getAllDesignation,
);

router.get(
  '/:id',
  auth("administrator"),
  permission(permissions.academics.designation.view),
  DesignationController.getDesignationById,
);

router.put(
  '/:id',
  auth("administrator"),
  permission(permissions.academics.designation.edit),
  validation(DesignationValidation.updateDesignationValidation),
  DesignationController.updateDesignationById,
);

router.delete(
  '/:id',
  auth("administrator"),
  permission(permissions.academics.designation.delete),
  DesignationController.deleteDesignationById,
);

export const DesignationRoutes = router;
