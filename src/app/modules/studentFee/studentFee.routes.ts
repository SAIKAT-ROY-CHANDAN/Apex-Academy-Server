import { Router } from 'express';
import { StudentFeeController } from './studentFee.controller';
import validation from '../../middlewares/validation';
import { StudentFeeValidation } from './studentFee.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.students.studentFee.create),
  validation(StudentFeeValidation.createStudentFeeValidation),
  StudentFeeController.createStudentFee,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.students.studentFee.view),
  StudentFeeController.getAllStudentFees,
);

router.get(
  '/due-with-details',
  auth('administrator'),
  StudentFeeController.getStudentFeeDueWithDetails,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentFee.edit),
  validation(StudentFeeValidation.updateStudentFeeValidation),
  StudentFeeController.updateStudentFee,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentFee.delete),
  StudentFeeController.deleteStudentFee,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentFee.view),
  StudentFeeController.getStudentFeeById,
);

export const StudentFeeRoutes = router;
