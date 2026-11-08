import { Router } from 'express';
import { WebsiteCurriculumController } from './websiteCurriculum.controller';
import validation from '../../middlewares/validation';
import { WebsiteCurriculumValidation } from './websiteCurriculum.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.websiteCurriculum.create),
  upload.fields([{ name: 'curriculum_file', maxCount: 1 }]),
  processUploads,
  validation(WebsiteCurriculumValidation.createWebsiteCurriculumValidation),
  WebsiteCurriculumController.createWebsiteCurriculum,
);

// Public list — the website frontend renders it too. Supports
// page/limit/searchTerm via the query builder.
router.get('/', WebsiteCurriculumController.getAllWebsiteCurriculums);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.websiteCurriculum.view),
  WebsiteCurriculumController.getWebsiteCurriculumById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.websiteCurriculum.edit),
  upload.fields([{ name: 'curriculum_file', maxCount: 1 }]),
  processUploads,
  validation(WebsiteCurriculumValidation.updateWebsiteCurriculumValidation),
  WebsiteCurriculumController.updateWebsiteCurriculum,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.websiteCurriculum.delete),
  WebsiteCurriculumController.deleteWebsiteCurriculum,
);

export const WebsiteCurriculumRoutes = router;
