import { Router } from 'express';
import { WebsitePrincipalController } from './websitePrincipal.controller';
import validation from '../../middlewares/validation';
import { WebsitePrincipalValidation } from './websitePrincipal.validation';
import auth from '../../middlewares/auth';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

// Public list — supports ?search= / ?searchTerm= via query builder
router.get('/', WebsitePrincipalController.getAllWebsitePrincipals);

router.get('/:id', WebsitePrincipalController.getWebsitePrincipalById);

router.post(
  '/',
  auth('administrator'),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'principal_photo', maxCount: 1 },
  ]),
  processUploads,
  validation(WebsitePrincipalValidation.createWebsitePrincipalValidation),
  WebsitePrincipalController.createWebsitePrincipal,
);

router.patch(
  '/:id',
  auth('administrator'),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'principal_photo', maxCount: 1 },
  ]),
  processUploads,
  validation(WebsitePrincipalValidation.updateWebsitePrincipalValidation),
  WebsitePrincipalController.updateWebsitePrincipal,
);

// Keep PUT for backward compat with existing website modules that use PUT
router.put(
  '/:id',
  auth('administrator'),
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'principal_photo', maxCount: 1 },
  ]),
  processUploads,
  validation(WebsitePrincipalValidation.updateWebsitePrincipalValidation),
  WebsitePrincipalController.updateWebsitePrincipal,
);

router.delete(
  '/:id',
  auth('administrator'),
  WebsitePrincipalController.deleteWebsitePrincipal,
);

export const WebsitePrincipalRoutes = router;
