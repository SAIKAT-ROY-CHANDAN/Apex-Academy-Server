import { Router } from 'express';
import { AcademicSectionController } from './academicSection.controller';
import validation from '../../middlewares/validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { AcademicSectionValidation } from './academicSection.validation';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.academics.academicSection.create),
  validation(AcademicSectionValidation.createAcademicSectionValidation),
  AcademicSectionController.createAcademicSection,
);

router.get(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.academicSection.view),
  AcademicSectionController.getAllAcademicSections,
);

router.get(
  '/filtered',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.academicSection.view),
  AcademicSectionController.getFilteredSections,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.academicSection.view),
  AcademicSectionController.getAcademicSectionById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.academicSection.edit),
  validation(AcademicSectionValidation.updateAcademicSectionValidation),
  AcademicSectionController.updateAcademicSection,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.academicSection.delete),
  AcademicSectionController.deleteAcademicSection,
);

export const AcademicSectionRoutes = router;