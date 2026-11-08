import { Router } from 'express';
import { WebsitePrincipalMessageController } from './websitePrincipalMessage.controller';
import validation from '../../middlewares/validation';
import { WebsitePrincipalMessageValidation } from './websitePrincipalMessage.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.principalMessage.create),
  upload.fields([{ name: 'principal_image', maxCount: 1 }]),
  processUploads,
  validation(
    WebsitePrincipalMessageValidation.createWebsitePrincipalMessageValidation,
  ),
  WebsitePrincipalMessageController.createWebsitePrincipalMessage,
);

router.get(
  '/',
  WebsitePrincipalMessageController.getWebsitePrincipalMessage,
);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.principalMessage.view),
  WebsitePrincipalMessageController.getWebsitePrincipalMessageById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.principalMessage.edit),
  upload.fields([{ name: 'principal_image', maxCount: 1 }]),
  processUploads,
  validation(
    WebsitePrincipalMessageValidation.updateWebsitePrincipalMessageValidation,
  ),
  WebsitePrincipalMessageController.updateWebsitePrincipalMessage,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.principalMessage.delete),
  WebsitePrincipalMessageController.deleteWebsitePrincipalMessage,
);

export const WebsitePrincipalMessageRoutes = router;
