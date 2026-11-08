import { Router } from 'express';
import { AcademicClassSubjectController } from './academicClassSubject.controller';
import validation from '../../middlewares/validation';
import { AcademicClassSubjectValidation } from './academicClassSubject.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.academics.academicClassSubject.create),
  validation(
    AcademicClassSubjectValidation.createAcademicClassSubjectValidation,
  ),
  AcademicClassSubjectController.createAcademicClassSubject,
);

router.get(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.academicClassSubject.view),
  AcademicClassSubjectController.getAllAcademicClassSubjects,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.academicClassSubject.view),
  AcademicClassSubjectController.getAcademicClassSubjectById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.academicClassSubject.edit),
  validation(
    AcademicClassSubjectValidation.updateAcademicClassSubjectValidation,
  ),
  AcademicClassSubjectController.updateAcademicClassSubject,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.academicClassSubject.delete),
  AcademicClassSubjectController.deleteAcademicClassSubject,
);

export const AcademicClassSubjectRoutes = router;