import { Router } from 'express';
import validation from '../../middlewares/validation';
import { AcademicClassValidation } from './academicClass.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { AcademicClassController } from './academicClass.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.academics.academicClass.create),
  validation(AcademicClassValidation.createAcademicClassValidation),
  AcademicClassController.createAcademicClass,
);

router.get(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.academicClass.view),
  AcademicClassController.getAllAcademicClasses,
);
router.get(
  '/departments/:departmentId',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.academicClass.view),
  AcademicClassController.getAcademicClassesByDepartmentId,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.academicClass.view),
  AcademicClassController.getAcademicClassById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.academicClass.edit),
  validation(AcademicClassValidation.updateAcademicClassValidation),
  AcademicClassController.updateAcademicClass,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.academicClass.delete),
  AcademicClassController.deleteAcademicClass,
);

export const AcademicClassRoutes = router;