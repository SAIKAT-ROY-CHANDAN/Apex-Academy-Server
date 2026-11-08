import { Router } from 'express';
import { StudentFeeCollectionItemController } from './studentFeeCollectionItem.controller';
import validation from '../../middlewares/validation';
import { StudentFeeCollectionItemValidation } from './studentFeeCollectionItem.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.students.studentFeeCollectionItem.create),
  validation(
    StudentFeeCollectionItemValidation.createStudentFeeCollectionItemValidation,
  ),
  StudentFeeCollectionItemController.createStudentFeeCollectionItem,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.students.studentFeeCollectionItem.view),
  StudentFeeCollectionItemController.getAllStudentFeeCollectionItems,
);

router.get(
  '/student/:studentId',
  auth('administrator'),
  permission(permissions.students.studentFeeCollectionItem.view),
  StudentFeeCollectionItemController.getStudentFeeCollectionItemsByStudent,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentFeeCollectionItem.view),
  StudentFeeCollectionItemController.getStudentFeeCollectionItemById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentFeeCollectionItem.edit),
  validation(
    StudentFeeCollectionItemValidation.updateStudentFeeCollectionItemValidation,
  ),
  StudentFeeCollectionItemController.updateStudentFeeCollectionItem,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentFeeCollectionItem.delete),
  StudentFeeCollectionItemController.deleteStudentFeeCollectionItem,
);

export const StudentFeeCollectionItemRoutes = router;

const editRouter = Router();

editRouter.put(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentFeeCollectionItem.edit),
  validation(
    StudentFeeCollectionItemValidation.editStudentFeeCollectionItemValidation,
  ),
  StudentFeeCollectionItemController.editStudentFeeCollectionItem,
);

export const StudentFeeCollectionItemEditRoutes = editRouter;
