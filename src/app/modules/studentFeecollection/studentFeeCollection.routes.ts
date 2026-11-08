import { Router } from 'express';
import validation from '../../middlewares/validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { StudentFeeCollectionValidation } from './studentFeeCollection.validation';
import { StudentFeeCollectionController } from './studentFeeCollection.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.students.studentFeeCollection.create),
  validation(
    StudentFeeCollectionValidation.createStudentFeeCollectionValidation,
  ),
  StudentFeeCollectionController.createStudentFeeCollection,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.students.studentFeeCollection.view),
  StudentFeeCollectionController.getAllStudentFeeCollections,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentFeeCollection.view),
  StudentFeeCollectionController.getStudentFeeCollectionById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentFeeCollection.edit),
  validation(
    StudentFeeCollectionValidation.updateStudentFeeCollectionValidation,
  ),
  StudentFeeCollectionController.updateStudentFeeCollection,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentFeeCollection.delete),
  StudentFeeCollectionController.deleteStudentFeeCollection,
);

export const StudentFeeCollectionRoutes = router;