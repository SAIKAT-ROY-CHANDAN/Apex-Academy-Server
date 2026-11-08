import { Router } from 'express';
import { AdmissionProgramController } from './admissionProgram.controller';
import validation from '../../middlewares/validation';
import { AdmissionProgramValidation } from './admissionProgram.validation';
import auth from '../../middlewares/auth';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

const ADMISSION_UPLOAD_FIELDS = [
  { name: 'admission_image', maxCount: 1 },
];

router.post(
  '/',
  auth('administrator'),
  upload.fields(ADMISSION_UPLOAD_FIELDS),
  processUploads,
  validation(AdmissionProgramValidation.createAdmissionProgramValidation),
  AdmissionProgramController.createAdmissionProgram,
);

router.get(
  '/',
  AdmissionProgramController.getAllAdmissionPrograms,
);

router.get(
  '/by-type',
  AdmissionProgramController.getActiveAdmissionProgramsByType,
);

router.get(
  '/:id',
  auth('administrator'),
  AdmissionProgramController.getAdmissionProgramById,
);

router.put(
  '/:id',
  auth('administrator'),
  upload.fields(ADMISSION_UPLOAD_FIELDS),
  processUploads,
  validation(AdmissionProgramValidation.updateAdmissionProgramValidation),
  AdmissionProgramController.updateAdmissionProgram,
);

router.delete(
  '/:id',
  auth('administrator'),
  AdmissionProgramController.deleteAdmissionProgram,
);

export const AdmissionProgramRoutes = router;