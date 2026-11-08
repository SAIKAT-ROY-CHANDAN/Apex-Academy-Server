import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { TeacherLeaveRequestValidation } from './teacherLeaveRequest.validation';
import { TeacherLeaveRequestController } from './teacherLeaveRequest.controller';

const router = Router();

router.post(
  '/',
  auth("teacher"),
  permission(permissions.teachers.teacherLeaveRequest.create),
  validation(TeacherLeaveRequestValidation.createTeacherLeaveRequestValidation),
  TeacherLeaveRequestController.createTeacherLeaveRequest,
);

router.get(
  '/',
  auth("administrator"),
  permission(permissions.teachers.teacherLeaveRequest.view),
  TeacherLeaveRequestController.getAllTeacherLeaveRequests,
);

router.get(
  '/:id',
  auth("administrator"),
  permission(permissions.teachers.teacherLeaveRequest.view),
  TeacherLeaveRequestController.getTeacherLeaveRequestById,
);

router.get("/teacher/:teacher_id",
  auth("teacher"),
  permission(permissions.teachers.teacherLeaveRequest.view),
  TeacherLeaveRequestController.getTeacherLeaveRequestByTeacherId,
);

router.put(
  '/:id',
  auth("administrator"),
  permission(permissions.teachers.teacherLeaveRequest.edit),
  validation(TeacherLeaveRequestValidation.updateTeacherLeaveRequestValidation),
  TeacherLeaveRequestController.updateTeacherLeaveRequestById,
);

router.delete(
  '/:id',
  auth("administrator"),
  permission(permissions.teachers.teacherLeaveRequest.delete),
  TeacherLeaveRequestController.deleteTeacherLeaveRequestById,
);

export const TeacherLeaveRequestRoutes = router;