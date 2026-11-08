import { Router } from 'express';
import { StudentPromotionController } from './student-promotion.controller';
import validation from '../../middlewares/validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { StudentPromotionValidation } from './student-promotion.validation';

const router = Router();

router.post(
  '/bulk',
  auth('administrator'),
  permission(permissions.students.studentEnrollment.edit),
  validation(StudentPromotionValidation.promoteManyStudentsValidation),
  StudentPromotionController.promoteManyStudents,
);

router.post(
  '/',
  auth('administrator'),
  permission(permissions.students.studentEnrollment.edit),
  validation(StudentPromotionValidation.promoteStudentValidation),
  StudentPromotionController.promoteStudent,
);

export const StudentPromotionRoutes = router;