import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { studentExamResultValidation } from './studentExamResult.validation';
import { studentExamResultController } from './studentExamResult.controller';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth(['administrator','teacher']),
  validation(studentExamResultValidation.create),
  permission(permissions.students.studentExamResult.create),
  studentExamResultController.createStudentExamResult,
);

router.get(
  '/',
  auth(['administrator', 'teacher', 'student']),
  permission(permissions.students.studentExamResult.view),
  studentExamResultController.getAllStudentExamResults,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher', 'student']),
  permission(permissions.students.studentExamResult.view),
  studentExamResultController.getStudentExamResultById,
);

router.patch(
  '/:id',
  auth(['administrator', 'teacher']),
  validation(studentExamResultValidation.update),
  permission(permissions.students.studentExamResult.edit),
  studentExamResultController.updateStudentExamResult,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentExamResult.delete),
  studentExamResultController.deleteStudentExamResult,
);

export const StudentExamResultRoutes = router;