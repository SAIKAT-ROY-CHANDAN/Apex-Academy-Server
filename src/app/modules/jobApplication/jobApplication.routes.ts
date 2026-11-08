import { Router } from 'express';
import { JobApplicationController } from './jobApplication.controller';
import validation from '../../middlewares/validation';
import { JobApplicationValidation } from './jobApplication.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

// Public — career/apply page: posts the application + uploads, then
// initiates the bKash payment for the circular's apply fee.
router.post(
  '/initiate',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'certificate', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
  ]),
  processUploads,
  validation(JobApplicationValidation.createJobApplicationValidation),
  JobApplicationController.initiateJobApplication,
);

// Public — career/job-apply-callback page: executed after bKash redirects back.
router.post(
  '/execute',
  validation(JobApplicationValidation.bkashExecuteValidation),
  JobApplicationController.executeJobApplication,
);

router.get(
  '/',
  auth('administrator'),
  // permission(permissions.website.jobCircular.view),
  JobApplicationController.getAllJobApplications,
);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.jobCircular.view),
  JobApplicationController.getJobApplicationById,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.website.jobCircular.delete),
  JobApplicationController.deleteJobApplication,
);

export const JobApplicationRoutes = router;