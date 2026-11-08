import { Router } from 'express';
import { AcademicNoticeController } from './academicNotice.controller';
import validation from '../../middlewares/validation';
import { AcademicNoticeValidation } from './academicNotice.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  upload.fields([{ name: 'pdf_file', maxCount: 1 }]),
  processUploads,
  validation(AcademicNoticeValidation.createAcademicNoticeValidation),
  AcademicNoticeController.createAcademicNotice,
);

router.get('/', AcademicNoticeController.getAllAcademicNotices);

router.get('/:id', AcademicNoticeController.getAcademicNoticeById);

router.put(
  '/:id',
  auth('administrator'),
  upload.fields([{ name: 'pdf_file', maxCount: 1 }]),
  processUploads,
  validation(AcademicNoticeValidation.updateAcademicNoticeValidation),
  AcademicNoticeController.updateAcademicNotice,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.settings.academicNotice.delete),
  AcademicNoticeController.deleteAcademicNotice,
);

export const AcademicNoticeRoutes = router;
