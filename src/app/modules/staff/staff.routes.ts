import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { StaffValidation } from './staff.validation';
import { StaffController } from './staff.controller';
import { upload, processUploads } from '../../middlewares/multer';
import parseFormData from '../../middlewares/parseFormData';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  upload.fields([
    { name: 'academic_document', maxCount: 1 },
    { name: 'previous_institution_resign_letter', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'nid_front', maxCount: 1 },
    { name: 'nid_back', maxCount: 1 },
  ]),
  parseFormData(['customSalaries']),
  permission(permissions.staff.staff.create),
  processUploads,
  validation(StaffValidation.createStaffValidation),
  StaffController.createStaff,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.staff.staff.view),
  StaffController.getAllStaff,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staff.view),
  StaffController.getStaffById,
);

router.put(
  '/:id',
  auth('administrator'),
  upload.fields([
    { name: 'academic_document', maxCount: 1 },
    { name: 'previous_institution_resign_letter', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'nid_front', maxCount: 1 },
    { name: 'nid_back', maxCount: 1 },
  ]),
  parseFormData(['customSalaries']),
  permission(permissions.staff.staff.edit),
  processUploads,
  validation(StaffValidation.updateStaffValidation),
  StaffController.updateStaffById,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staff.delete),
  StaffController.deleteStaffById,
);

export const StaffRoutes = router;
