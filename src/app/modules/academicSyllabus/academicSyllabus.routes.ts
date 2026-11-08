import { Router } from 'express';
import { AcademicSyllabusController } from './academicSyllabus.controller';
import validation from '../../middlewares/validation';
import { AcademicSyllabusValidation } from './academicSyllabus.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  upload.fields([{ name: 'syllabus_file', maxCount: 1 }]),
  processUploads,
  validation(AcademicSyllabusValidation.createAcademicSyllabusValidation),
  AcademicSyllabusController.createAcademicSyllabus,
);

router.get('/', AcademicSyllabusController.getAllAcademicSyllabuses);

router.get('/:id', AcademicSyllabusController.getAcademicSyllabusById);

router.put(
  '/:id',
  auth('administrator'),
  upload.fields([{ name: 'syllabus_file', maxCount: 1 }]),
  processUploads,
  validation(AcademicSyllabusValidation.updateAcademicSyllabusValidation),
  AcademicSyllabusController.updateAcademicSyllabus,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.settings.academicSyllabus.delete),
  AcademicSyllabusController.deleteAcademicSyllabus,
);

export const AcademicSyllabusRoutes = router;
