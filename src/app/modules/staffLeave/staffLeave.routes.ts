import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { StaffLeaveValidation } from './staffLeave.validation';
import { StaffLeaveController } from './staffLeave.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.staff.staffLeave.create),
  validation(StaffLeaveValidation.createStaffLeaveValidation),
  StaffLeaveController.createStaffLeave,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.staff.staffLeave.view),
  StaffLeaveController.getAllStaffLeaves,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staffLeave.view),
  StaffLeaveController.getStaffLeaveById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staffLeave.edit),
  validation(StaffLeaveValidation.updateStaffLeaveValidation),
  StaffLeaveController.updateStaffLeaveById,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staffLeave.delete),
  StaffLeaveController.deleteStaffLeaveById,
);

export const StaffLeaveRoutes = router;
