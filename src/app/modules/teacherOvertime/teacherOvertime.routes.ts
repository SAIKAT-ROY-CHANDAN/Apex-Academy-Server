import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { TeacherOvertimeValidation } from './teacherOvertime.validation';
import { TeacherOvertimeController } from './teacherOvertime.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.teachers.teacherOvertime.create),
  validation(TeacherOvertimeValidation.createTeacherOvertimeValidation),
  TeacherOvertimeController.createTeacherOvertime,
);

router.post(
  '/start',
  auth('administrator'),
  permission(permissions.teachers.teacherOvertime.create),
  validation(TeacherOvertimeValidation.createTeacherOvertimeValidation),
  TeacherOvertimeController.startTeacherOvertime,
);

router.post(
  '/end',
  auth('administrator'),
  permission(permissions.teachers.teacherOvertime.edit),
  validation(TeacherOvertimeValidation.endTeacherOvertimeValidation),
  TeacherOvertimeController.endTeacherOvertime,
);

router.post(
  '/today-status',
  auth('administrator'),
  permission(permissions.teachers.teacherOvertime.view),
  validation(TeacherOvertimeValidation.todayStatusValidation),
  TeacherOvertimeController.getTodayOvertimeStatus,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.teachers.teacherOvertime.view),
  TeacherOvertimeController.getAllTeacherOvertimes,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.teachers.teacherOvertime.view),
  TeacherOvertimeController.getTeacherOvertimeById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.teachers.teacherOvertime.edit),
  validation(TeacherOvertimeValidation.updateTeacherOvertimeValidation),
  TeacherOvertimeController.updateTeacherOvertimeById,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.teachers.teacherOvertime.delete),
  TeacherOvertimeController.deleteTeacherOvertimeById,
);

export const TeacherOvertimeRoutes = router;
