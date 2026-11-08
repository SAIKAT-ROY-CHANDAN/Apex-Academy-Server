import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { StudentLeaveRequestValidation } from './studentLeaveRequest.validation';
import { StudentLeaveRequestController } from './studentLeaveRequest.controller';

const router = Router();

// Student creates leave request
router.post(
  '/',
  auth('student'),
  validation(StudentLeaveRequestValidation.createStudentLeaveRequestValidation),
  StudentLeaveRequestController.createStudentLeaveRequest,
);

// Student: get own requests (must be before /:id)
router.get(
  '/my-requests',
  auth('student'),
  StudentLeaveRequestController.getMyLeaveRequests,
);

// Student: get own stats
router.get(
  '/my-stats',
  auth('student'),
  StudentLeaveRequestController.getStudentLeaveStats,
);

// Admin: get stats across all
router.get(
  '/stats',
  auth('administrator'),
  permission(permissions.students.studentLeaveRequest.view),
  StudentLeaveRequestController.getStudentLeaveStats,
);

// Admin: get all leave requests
router.get(
  '/',
  auth('administrator'),
  permission(permissions.students.studentLeaveRequest.view),
  StudentLeaveRequestController.getAllStudentLeaveRequests,
);

// Admin or student: get by student id
router.get(
  '/student/:studentId',
  auth(['administrator', 'student'] as any),
  StudentLeaveRequestController.getStudentLeaveRequestsByStudentId,
);

// Shared: get single by id (admin or owner student)
router.get(
  '/:id',
  auth(['administrator', 'student'] as any),
  StudentLeaveRequestController.getStudentLeaveRequestById,
);

// Admin only: approve/reject/edit
router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.students.studentLeaveRequest.edit),
  validation(StudentLeaveRequestValidation.updateStudentLeaveRequestValidation),
  StudentLeaveRequestController.updateStudentLeaveRequestById,
);

// Admin or student owner: delete (student can only delete pending own)
router.delete(
  '/:id',
  auth(['administrator', 'student'] as any),
  permission(permissions.students.studentLeaveRequest.delete),
  StudentLeaveRequestController.deleteStudentLeaveRequestById,
);

export const StudentLeaveRequestRoutes = router;
