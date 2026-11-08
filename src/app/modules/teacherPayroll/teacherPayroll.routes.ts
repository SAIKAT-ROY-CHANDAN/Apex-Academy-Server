import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { TeacherPayrollValidation } from './teacherPayroll.validation';
import { TeacherPayrollController } from './teacherPayroll.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.teachers.teacherPayroll.create),
  validation(TeacherPayrollValidation.createTeacherPayrollValidation),
  TeacherPayrollController.createTeacherPayroll,
);

router.get(
  '/calculate',
  auth('administrator'),
  permission(permissions.teachers.teacherPayroll.view),
  TeacherPayrollController.calculateTeacherPayrollPreview,
);

router.get(
  '/history',
  auth('administrator'),
  permission(permissions.teachers.teacherPayroll.view),
  TeacherPayrollController.getTeacherPayrollHistory,
);

router.get(
  '/preview',
  // auth('administrator'),
  // permission(permissions.teachers.teacherPayroll.view),
  TeacherPayrollController.previewAllTeacherPayrolls,
);

export const TeacherPayrollRoutes = router;
