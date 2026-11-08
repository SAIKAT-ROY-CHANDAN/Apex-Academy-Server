import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { StudentAttendanceValidation } from './studentAttendance.validation';
import { StudentAttendanceController } from './studentAttendance.controller';

const router = Router();

router.post(
  '/bulk',
  auth(['administrator', 'teacher']),
  permission(permissions.students.studentAttendance.create),
  validation(StudentAttendanceValidation.createManyStudentAttendanceValidation),
  StudentAttendanceController.createManyStudentAttendances,
);

router.post(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.students.studentAttendance.create),
  validation(StudentAttendanceValidation.createStudentAttendanceValidation),
  StudentAttendanceController.createStudentAttendance,
);

router.get(
  '/',
  auth(['administrator', 'teacher', 'student']),
  permission(permissions.students.studentAttendance.view),
  StudentAttendanceController.getAllStudentAttendances,
);

router.get(
  '/class-taken-report',
  auth(['administrator', 'teacher']),
  permission(permissions.students.studentAttendance.view),
  StudentAttendanceController.getClassTakenReport,
);

router.get(
  '/check-today',
  auth(['administrator', 'teacher', 'student']),
  permission(permissions.students.studentAttendance.view),
  StudentAttendanceController.getTodayAttendanceStatus,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher', 'student']),
  permission(permissions.students.studentAttendance.view),
  StudentAttendanceController.getStudentAttendanceById,
);

router.put(
  '/bulk',
  auth(['administrator', 'teacher']),
  permission(permissions.students.studentAttendance.edit),
  validation(StudentAttendanceValidation.updateManyStudentAttendanceValidation),
  StudentAttendanceController.updateManyStudentAttendances,
);

router.put(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.students.studentAttendance.edit),
  validation(StudentAttendanceValidation.updateStudentAttendanceValidation),
  StudentAttendanceController.updateStudentAttendanceById,
);

router.delete(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.students.studentAttendance.delete),
  StudentAttendanceController.deleteStudentAttendanceById,
);

export const StudentAttendanceRoutes = router;