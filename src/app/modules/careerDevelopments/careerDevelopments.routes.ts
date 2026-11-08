import { Router } from 'express';
import { CareerDevelopmentsController } from './careerDevelopments.controller';
import validation from '../../middlewares/validation';
import { CareerDevelopmentsValidation } from './careerDevelopments.validation';
import auth from '../../middlewares/auth';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

const CAREER_UPLOAD_FIELDS = [
  { name: 'career_image', maxCount: 1 },
];

router.post(
  '/',
  auth('administrator'),
  upload.fields(CAREER_UPLOAD_FIELDS),
  processUploads,
  validation(CareerDevelopmentsValidation.createCareerDevelopmentsValidation),
  CareerDevelopmentsController.createCareerDevelopments,
);

router.get(
  '/',
  CareerDevelopmentsController.getAllCareerDevelopments,
);

router.get(
  '/active',
  CareerDevelopmentsController.getActiveCareerDevelopments,
);

router.get(
  '/:id',
  auth('administrator'),
  CareerDevelopmentsController.getCareerDevelopmentsById,
);

router.put(
  '/:id',
  auth('administrator'),
  upload.fields(CAREER_UPLOAD_FIELDS),
  processUploads,
  validation(CareerDevelopmentsValidation.updateCareerDevelopmentsValidation),
  CareerDevelopmentsController.updateCareerDevelopments,
);

router.delete(
  '/:id',
  auth('administrator'),
  CareerDevelopmentsController.deleteCareerDevelopments,
);

export const CareerDevelopmentsRoutes = router;