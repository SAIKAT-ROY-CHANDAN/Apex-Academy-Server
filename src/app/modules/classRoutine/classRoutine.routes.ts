import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { classRoutineValidation } from './classRoutine.validation';
import { classRoutineController } from './classRoutine.controller';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  validation(classRoutineValidation.create),
  permission(permissions.academics.classRoutine.create),
  classRoutineController.createClassRoutine,
);

router.get(
  '/',
  auth(['administrator', 'teacher', 'student']),
  permission(permissions.academics.classRoutine.view),
  classRoutineController.getAllClassRoutines,
);

// Teacher's own routine — MUST come before /:id
router.get(
  '/my-routine',
  auth(['teacher','student']),
  permission(permissions.academics.classRoutine.view),
  classRoutineController.getMyClassRoutine,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher', 'student']),
  permission(permissions.academics.classRoutine.view),
  classRoutineController.getClassRoutineById,
);

router.patch(
  '/:id',
  auth('administrator'),
  validation(classRoutineValidation.update),
  permission(permissions.academics.classRoutine.edit),
  classRoutineController.updateClassRoutine,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.classRoutine.delete),
  classRoutineController.deleteClassRoutine,
);

export const ClassRoutineRoutes = router;