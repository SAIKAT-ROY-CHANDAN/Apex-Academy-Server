import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { StaffOvertimeValidation } from './staffOvertime.validation';
import { StaffOvertimeController } from './staffOvertime.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.staff.staffOvertime.create),
  validation(StaffOvertimeValidation.createStaffOvertimeValidation),
  StaffOvertimeController.createStaffOvertime,
);

router.post(
  '/start',
  auth('administrator'),
  permission(permissions.staff.staffOvertime.create),
  validation(StaffOvertimeValidation.createStaffOvertimeValidation),
  StaffOvertimeController.startStaffOvertime,
);

router.post(
  '/end',
  auth('administrator'),
  permission(permissions.staff.staffOvertime.edit),
  validation(StaffOvertimeValidation.endStaffOvertimeValidation),
  StaffOvertimeController.endStaffOvertime,
);

router.post(
  '/today-status',
  auth('administrator'),
  permission(permissions.staff.staffOvertime.view),
  validation(StaffOvertimeValidation.todayStatusValidation),
  StaffOvertimeController.getTodayOvertimeStatus,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.staff.staffOvertime.view),
  StaffOvertimeController.getAllStaffOvertimes,
);

router.get(
  '/staff/:staffId',
  auth('administrator'),
  permission(permissions.staff.staffOvertime.create),
  StaffOvertimeController.createStaffOvertimeByStaffId,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staffOvertime.view),
  StaffOvertimeController.getStaffOvertimeById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staffOvertime.edit),
  validation(StaffOvertimeValidation.updateStaffOvertimeValidation),
  StaffOvertimeController.updateStaffOvertimeById,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staffOvertime.delete),
  StaffOvertimeController.deleteStaffOvertimeById,
);

export const StaffOvertimeRoutes = router;
