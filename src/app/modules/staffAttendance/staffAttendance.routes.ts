import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { StaffAttendanceValidation } from './staffAttendance.validation';
import { StaffAttendanceController } from './staffAttendance.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.staff.staffAttendance.create),
  validation(StaffAttendanceValidation.createStaffAttendanceValidation),
  StaffAttendanceController.createStaffAttendance,
);

router.post(
  '/today-status',
  auth('administrator'),
  permission(permissions.staff.staffAttendance.view),
  validation(StaffAttendanceValidation.getTodayAttendanceStatusValidation),
  StaffAttendanceController.getTodayAttendanceStatusForStaff,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.staff.staffAttendance.view),
  StaffAttendanceController.getAllStaffAttendances,
);

// NOTE: must be registered before '/:id' or "report" is treated as an id.
router.get(
  '/report',
  auth('administrator'),
  permission(permissions.staff.staffAttendance.view),
  StaffAttendanceController.getStaffAttendanceReport,
);

// NOTE: must be registered before '/:id' or "history" is treated as an id.
router.get(
  '/history/:staff_id',
  auth('administrator'),
  permission(permissions.staff.staffAttendance.view),
  StaffAttendanceController.getStaffAttendanceHistory,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staffAttendance.view),
  StaffAttendanceController.getStaffAttendanceById,
);

router.get(
  '/check-in/:staff_id',
  auth('administrator'),
  permission(permissions.staff.staffAttendance.view),
  StaffAttendanceController.isTodayCheckInExists,
);

router.get(
  '/check-out/:staff_id',
  auth('administrator'),
  permission(permissions.staff.staffAttendance.view),
  StaffAttendanceController.isTodayCheckOutExists,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staffAttendance.edit),
  validation(StaffAttendanceValidation.updateStaffAttendanceValidation),
  StaffAttendanceController.updateStaffAttendanceById,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staffAttendance.delete),
  StaffAttendanceController.deleteStaffAttendanceById,
);

export const StaffAttendanceRoutes = router;