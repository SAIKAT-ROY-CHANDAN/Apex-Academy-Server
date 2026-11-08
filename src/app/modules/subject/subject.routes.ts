import { Router } from 'express';
import { SubjectController } from './subject.controller';
import validation from '../../middlewares/validation';
import { SubjectValidation } from './subject.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.academics.subject.create),
  validation(SubjectValidation.createSubjectValidation),
  SubjectController.createSubject,
);

router.get(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.subject.view),
  SubjectController.getAllSubjects,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.subject.view),
  SubjectController.getSubjectById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.subject.edit),
  validation(SubjectValidation.updateSubjectValidation),
  SubjectController.updateSubject,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.subject.delete),
  SubjectController.deleteSubject,
);

export const SubjectRoutes = router;