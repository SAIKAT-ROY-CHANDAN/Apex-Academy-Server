import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { TeacherAttendanceValidation } from './teacherAttendance.validation';
import { TeacherAttendanceController } from './teacherAttendance.controller';

const router = Router();

router.post(
  '/',
  auth("administrator"),
  permission(permissions.teachers.teacherAttendance.create),
  validation(TeacherAttendanceValidation.createTeacherAttendanceValidation),
  TeacherAttendanceController.createTeacherAttendance,
);

router.post(
  '/today-status',
  auth("administrator"),
  permission(permissions.teachers.teacherAttendance.view),
  validation(TeacherAttendanceValidation.getTodayAttendanceStatusValidation),
  TeacherAttendanceController.getTodayAttendanceStatusForTeachers,
);

router.get(
  '/',
  auth("administrator"),
  permission(permissions.teachers.teacherAttendance.view),
  TeacherAttendanceController.getAllTeacherAttendances,
);

router.get(
  '/report',
  auth("administrator"),
  permission(permissions.teachers.teacherAttendance.view),
  TeacherAttendanceController.getTeacherAttendanceReport,
);

// Must be registered before '/:id' so it isn't shadowed by it.
router.get(
  '/history/:teacher_id',
  auth("administrator"),
  permission(permissions.teachers.teacherAttendance.view),
  TeacherAttendanceController.getTeacherAttendanceHistory,
);

router.get(
  '/:id',
  auth("administrator"),
  permission(permissions.teachers.teacherAttendance.view),
  TeacherAttendanceController.getTeacherAttendanceById,
);

router.get(
  '/check-in/:teacher_id',
  auth("administrator"),
  permission(permissions.teachers.teacherAttendance.view),
  TeacherAttendanceController.isTodayCheckInExists,
);

router.get(
  '/check-out/:teacher_id',
  auth("administrator"),
  permission(permissions.teachers.teacherAttendance.view),
  TeacherAttendanceController.isTodayCheckOutExists,
);

router.put(
  '/:id',
  auth("administrator"),
  permission(permissions.teachers.teacherAttendance.edit),
  validation(TeacherAttendanceValidation.updateTeacherAttendanceValidation),
  TeacherAttendanceController.updateTeacherAttendanceById,
);

router.delete(
  '/:id',
  auth("administrator"),
  permission(permissions.teachers.teacherAttendance.delete),
  TeacherAttendanceController.deleteTeacherAttendanceById,
);

export const TeacherAttendanceRoutes = router;