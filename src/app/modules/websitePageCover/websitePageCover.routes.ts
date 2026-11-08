import { Router } from 'express';
import { WebsitePageCoverController } from './websitePageCover.controller';
import validation from '../../middlewares/validation';
import { WebsitePageCoverValidation } from './websitePageCover.validation';
import auth from '../../middlewares/auth';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

const pageCoverFields = [
  { name: 'aboutCollege', maxCount: 1 },
  { name: 'managementTeam', maxCount: 1 },
  { name: 'academic', maxCount: 1 },
  { name: 'students', maxCount: 1 },
  { name: 'gallery', maxCount: 1 },
  { name: 'career', maxCount: 1 },
  { name: 'noticeBoard', maxCount: 1 },
  { name: 'contactUs', maxCount: 1 },
];

router.get(
  '/',
  WebsitePageCoverController.getAllPageCovers,
);

router.post(
  '/',
  auth('administrator'),
  upload.fields(pageCoverFields),
  processUploads,
  validation(WebsitePageCoverValidation.upsertWebsitePageCoverValidation),
  WebsitePageCoverController.upsertPageCovers,
);

router.delete(
  '/',
  auth('administrator'),
  WebsitePageCoverController.deleteAllPageCovers,
);

export const WebsitePageCoverRoutes = router;
