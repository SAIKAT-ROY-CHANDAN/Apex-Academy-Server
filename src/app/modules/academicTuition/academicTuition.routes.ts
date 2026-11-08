import { Router } from 'express';
import { AcademicTuitionController } from './academicTuition.controller';
import validation from '../../middlewares/validation';
import { AcademicTuitionValidation } from './academicTuition.validation';
import auth from '../../middlewares/auth';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  upload.fields([{ name: 'tuition_image', maxCount: 1 }]),
  processUploads,
  validation(AcademicTuitionValidation.createAcademicTuitionValidation),
  AcademicTuitionController.createAcademicTuition,
);

router.get('/', AcademicTuitionController.getAllAcademicTuitions);

router.get('/:id', AcademicTuitionController.getAcademicTuitionById);

router.put(
  '/:id',
  auth('administrator'),
  upload.fields([{ name: 'tuition_image', maxCount: 1 }]),
  processUploads,
  validation(AcademicTuitionValidation.updateAcademicTuitionValidation),
  AcademicTuitionController.updateAcademicTuition,
);

router.delete(
  '/:id',
  auth('administrator'),
  AcademicTuitionController.deleteAcademicTuition,
);

export const AcademicTuitionRoutes = router;
