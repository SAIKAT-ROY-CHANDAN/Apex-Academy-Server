import { Router } from 'express';
import { AcademicFacilitiesController } from './academicFacilities.controller';
import validation from '../../middlewares/validation';
import { AcademicFacilitiesValidation } from './academicFacilities.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

const FACILITIES_UPLOAD_FIELDS = [
  { name: 'main_image', maxCount: 1 },
  { name: 'sub_one_image', maxCount: 1 },
  { name: 'sub_two_image', maxCount: 1 },
];

router.post(
  '/',
  auth('administrator'),
  upload.fields(FACILITIES_UPLOAD_FIELDS),
  processUploads,
  validation(
    AcademicFacilitiesValidation.createAcademicFacilitiesValidation,
  ),
  AcademicFacilitiesController.createAcademicFacilities,
);

router.get('/', AcademicFacilitiesController.getAllAcademicFacilities);

// Dynamic by-type must be before /:id to avoid shadowing
router.get('/type/:type', AcademicFacilitiesController.getAcademicFacilitiesByType);

router.get('/:id', AcademicFacilitiesController.getAcademicFacilitiesById);

router.put(
  '/:id',
  auth('administrator'),
  upload.fields(FACILITIES_UPLOAD_FIELDS),
  processUploads,
  validation(
    AcademicFacilitiesValidation.updateAcademicFacilitiesValidation,
  ),
  AcademicFacilitiesController.updateAcademicFacilities,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.settings.academicFacilities.delete),
  AcademicFacilitiesController.deleteAcademicFacilities,
);

export const AcademicFacilitiesRoutes = router;
