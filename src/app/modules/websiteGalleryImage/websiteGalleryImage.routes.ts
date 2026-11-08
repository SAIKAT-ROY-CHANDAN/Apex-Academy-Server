import { Router } from 'express';
import { WebsiteGalleryImageController } from './websiteGalleryImage.controller';
import validation from '../../middlewares/validation';
import { WebsiteGalleryImageValidation } from './websiteGalleryImage.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';
import { NextFunction, Request, Response } from 'express';

const router = Router();

// Only run multer when the request actually has a file upload (multipart/form-data).
// JSON submissions (e.g. video-only entries) skip multer entirely.
const conditionalGalleryUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.fields([{ name: 'gallery_image', maxCount: 1 }])(
      req,
      res,
      (err) => {
        if (err) return next(err);
        processUploads(req, res, next);
      },
    );
  } else {
    next();
  }
};

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.website.galleryImage.create),
  conditionalGalleryUpload,
  validation(
    WebsiteGalleryImageValidation.createWebsiteGalleryImageValidation,
  ),
  WebsiteGalleryImageController.createWebsiteGalleryImage,
);

// Public list — the website frontend renders it too. Supports
// page/limit/searchTerm via the query builder.
router.get(
  '/',
  WebsiteGalleryImageController.getAllWebsiteGalleryImages,
);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.galleryImage.view),
  WebsiteGalleryImageController.getWebsiteGalleryImageById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.galleryImage.edit),
  conditionalGalleryUpload,
  validation(
    WebsiteGalleryImageValidation.updateWebsiteGalleryImageValidation,
  ),
  WebsiteGalleryImageController.updateWebsiteGalleryImage,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.galleryImage.delete),
  WebsiteGalleryImageController.deleteWebsiteGalleryImage,
);

export const WebsiteGalleryImageRoutes = router;
