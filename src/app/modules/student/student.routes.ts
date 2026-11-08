import { Router } from 'express';
import { StudentController } from './student.controller';
import validation from '../../middlewares/validation';
import { StudentValidation } from './student.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';
import parseFormData from '../../middlewares/parseFormData';

const router = Router();
router.post(
  '/login',
  validation(StudentValidation.loginStudentValidation),
  StudentController.studentLogin,
);
router.post(
  '/register',
  upload.single('photo'),
  validation(StudentValidation.registerStudentValidation),
  processUploads,
  StudentController.registerStudent,
);
router.post(
  '/send-class-message',
  auth('administrator'),
  permission(permissions.communications.bulkSms.manage),
  validation(StudentValidation.sendClassMessageValidation),
  StudentController.sendClassMessage,
);
router.post(
  '/',
  auth('administrator'),
  permission(permissions.students.student.create),
  upload.single('photo'),
  parseFormData(['enrollment', 'studentFeeCollection', 'hostelAllocation', 'hostelFeeCollection']),
  processUploads,
  validation(StudentValidation.createStudentValidation),
  StudentController.createStudent,
);
router.get(
  '/me',
  auth('student'),
  StudentController.getMyProfile,
);
router.get(
  '/due-fee',
  auth('student'),
  // permission(permissions.students.student.create),
  StudentController.getStudentDueFee,
);
router.post(
  '/fee-collection',
  auth('administrator'),
  permission(permissions.students.studentFeeCollection.create),
  // validation(StudentValidation.createStudentValidation),
  StudentController.feeCollection,
);
router.post(
  '/self-fee-collection',
  auth('student'),
  StudentController.selfStudentFeeCollection,
);
router.patch(
  '/self-due-fee-collection',
  auth('student'),
  StudentController.selfStudentDueFeeCollection,
);
router.post(
  '/admin-due-payment',
  auth('administrator'),
  StudentController.adminDuePayment,
);
router.post(
  '/bkash/initiate',
  auth('student'),
  StudentController.initiateStudentBkashPayment,
);
router.post(
  '/bkash/execute',
  auth('student'),
  validation(StudentValidation.bkashExecuteValidation),
  StudentController.executeStudentBkashPayment,
);
router.get(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.students.student.view),
  StudentController.getAllStudents,
);

router.get(
  '/students-by-class-section',
  auth(['administrator', 'teacher']),
  permission(permissions.students.student.view),
  StudentController.getStudentsByClassIdAndSectionId,
);

router.get(
  '/search-students',
  auth(['administrator', 'teacher']),
  permission(permissions.students.student.view),
  StudentController.searchStudents,
);

router.get(
  '/approval-request',
  auth('administrator'),
  permission(permissions.students.studentApproval.manage),
  StudentController.getPendingStudents,
);

router.patch(
  '/:id/approve',
  auth('administrator'),
  permission(permissions.students.studentApproval.manage),
  StudentController.approveStudent,
);

router.patch(
  '/:id/reject',
  auth('administrator'),
  permission(permissions.students.studentApproval.manage),
  StudentController.rejectStudent,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.students.student.view),
  StudentController.getStudentById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.students.student.edit),
  upload.single('photo'),
  parseFormData(['enrollment', 'studentFeeCollection', 'hostelAllocation', 'hostelFeeCollection']),
  processUploads,
  validation(StudentValidation.updateStudentValidation),
  StudentController.updateStudent,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.students.student.delete),
  StudentController.deleteStudent,
);

export const StudentRoutes = router;
