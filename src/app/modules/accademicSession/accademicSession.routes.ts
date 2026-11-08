import { Router } from 'express';
import validation from '../../middlewares/validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { AcademicSessionValidation } from './accademicSession.validation';
import { AcademicSessionController } from './accademicSession.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.academics.academicSession.create),
  validation(AcademicSessionValidation.createAcademicSessionValidation),
  AcademicSessionController.createAcademicSession,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.academics.academicSession.view),
  AcademicSessionController.getAllAcademicSessions,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.academicSession.view),
  AcademicSessionController.getAcademicSessionById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.academicSession.edit),
  validation(AcademicSessionValidation.updateAcademicSessionValidation),
  AcademicSessionController.updateAcademicSession,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.academicSession.delete),
  AcademicSessionController.deleteAcademicSession,
);

export const AcademicSessionRoutes = router;