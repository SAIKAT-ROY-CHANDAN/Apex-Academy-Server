import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { gradeSystemValidation } from './gradeSystem.validation';
import { gradeSystemController } from './gradeSystem.controller';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  validation(gradeSystemValidation.create),
  permission(permissions.academics.gradeSystem.create),
  gradeSystemController.createGradeSystem,
);

router.get(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.gradeSystem.view),
  gradeSystemController.getAllGradeSystems,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.gradeSystem.view),
  gradeSystemController.getGradeSystemById,
);

router.patch(
  '/:id',
  auth('administrator'),
  validation(gradeSystemValidation.update),
  permission(permissions.academics.gradeSystem.edit),
  gradeSystemController.updateGradeSystem,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.gradeSystem.delete),
  gradeSystemController.deleteGradeSystem,
);

export const GradeSystemRoutes = router;