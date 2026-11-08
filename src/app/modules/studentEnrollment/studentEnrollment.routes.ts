import { Router } from 'express';
import { StudentEnrollmentController } from './studentEnrollment.controller';
import validation from '../../middlewares/validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { StudentEnrollmentValidation } from './studentEnrollment.validation';

const router = Router();

router.post(
  '/supplementary-attempt',
  auth('administrator'),
  permission(permissions.students.studentEnrollment.create),
  validation(StudentEnrollmentValidation.createSupplementaryAttemptValidation),
  StudentEnrollmentController.createSupplementaryAttempt,
);

router.post(
  '/',
  auth('administrator'),
  permission(permissions.students.studentEnrollment.create),
  validation(StudentEnrollmentValidation.createStudentEnrollmentValidation),
  StudentEnrollmentController.createStudentEnrollment,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.students.studentEnrollment.view),
  StudentEnrollmentController.getAllStudentEnrollments,
);

// Student's own enrollments (current + previous years) — MUST come before /:id
router.get(
  '/my-enrollments',
  auth(['student']),
  StudentEnrollmentController.getMyEnrollments,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentEnrollment.view),
  StudentEnrollmentController.getStudentEnrollmentById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentEnrollment.edit),
  validation(StudentEnrollmentValidation.updateStudentEnrollmentValidation),
  StudentEnrollmentController.updateStudentEnrollment,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentEnrollment.delete),
  StudentEnrollmentController.deleteStudentEnrollment,
);

export const StudentEnrollmentRoutes = router;