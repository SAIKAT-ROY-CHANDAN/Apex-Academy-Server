import { Router } from 'express';
import { WebsiteChairmanMessageController } from './websiteChairmanMessage.controller';
import validation from '../../middlewares/validation';
import { WebsiteChairmanMessageValidation } from './websiteChairmanMessage.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.chairmanMessage.create),
  upload.fields([{ name: 'chairman_image', maxCount: 1 }]),
  processUploads,
  validation(WebsiteChairmanMessageValidation.createWebsiteChairmanMessageValidation),
  WebsiteChairmanMessageController.createWebsiteChairmanMessage,
);

router.get(
  '/',
  WebsiteChairmanMessageController.getWebsiteChairmanMessage,
);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.chairmanMessage.view),
  WebsiteChairmanMessageController.getWebsiteChairmanMessageById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.chairmanMessage.edit),
  upload.fields([{ name: 'chairman_image', maxCount: 1 }]),
  processUploads,
  validation(WebsiteChairmanMessageValidation.updateWebsiteChairmanMessageValidation),
  WebsiteChairmanMessageController.updateWebsiteChairmanMessage,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.chairmanMessage.delete),
  WebsiteChairmanMessageController.deleteWebsiteChairmanMessage,
);

export const WebsiteChairmanMessageRoutes = router;
