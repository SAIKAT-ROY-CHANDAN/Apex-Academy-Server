import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { StaffPayrollValidation } from './staffPayroll.validation';
import { StaffPayrollController } from './staffPayroll.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.staff.staffPayroll.create),
  validation(StaffPayrollValidation.createStaffPayrollValidation),
  StaffPayrollController.createStaffPayroll,
);

router.get(
  '/calculate',
  auth('administrator'),
  permission(permissions.staff.staffPayroll.view),
  StaffPayrollController.calculateStaffPayrollPreview,
);

router.get(
  '/history',
  auth('administrator'),
  permission(permissions.staff.staffPayroll.view),
  StaffPayrollController.getStaffPayrollHistory,
);

router.get(
  '/preview',
  // auth('administrator'),
  // permission(permissions.staff.staffPayroll.view),
  StaffPayrollController.previewAllStaffPayrolls,
);

export const StaffPayrollRoutes = router;
