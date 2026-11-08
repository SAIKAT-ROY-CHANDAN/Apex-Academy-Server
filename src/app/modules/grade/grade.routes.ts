import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { gradeValidation } from './grade.validation';
import { gradeController } from './grade.controller';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

// fetch current grade scale (visible to admin/teacher/student for display)
router.get(
  '/',
  auth(['administrator', 'teacher', 'student']),
  permission(permissions.academics.gradeSystem.view),
  gradeController.getGradeScale,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.gradeSystem.view),
  gradeController.getGradeScaleById,
);

// calculate percentage/grade on the fly (useful for preview)
router.post(
  '/calculate',
  auth(['administrator', 'teacher']),
  validation(gradeValidation.studentResult),
  gradeController.calculateResult,
);

// admin-only mutations
router.post(
  '/',
  auth('administrator'),
  validation(gradeValidation.createGradeScale),
  permission(permissions.academics.gradeSystem.create),
  gradeController.createGradeScale,
);

router.patch(
  '/:id',
  auth('administrator'),
  validation(gradeValidation.updateGradeScale),
  permission(permissions.academics.gradeSystem.edit),
  gradeController.updateGradeScale,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.gradeSystem.delete),
  gradeController.deleteGradeScale,
);

export const GradeRoutes = router;
