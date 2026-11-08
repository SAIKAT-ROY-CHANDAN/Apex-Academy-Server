import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { TeacherResignationValidation } from './teacherResignation.validation';
import { TeacherResignationController } from './teacherResignation.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.teachers.teacherResignation.create),
  validation(TeacherResignationValidation.createTeacherResignationValidation),
  TeacherResignationController.createTeacherResignation,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.teachers.teacherResignation.view),
  TeacherResignationController.getAllTeacherResignations,
);

router.post(
  '/teacher',
  auth('teacher'),
  permission(permissions.teachers.teacherResignation.create),
  validation(TeacherResignationValidation.createTeacherResignationValidation),
  TeacherResignationController.createTeacherResignation,
);

router.get(
  '/teacher/:teacher_id',
  auth('teacher'),
  permission(permissions.teachers.teacherResignation.view),
  TeacherResignationController.getTeacherResignationByTeacherId,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.teachers.teacherResignation.view),
  TeacherResignationController.getTeacherResignationById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.teachers.teacherResignation.edit),
  validation(TeacherResignationValidation.updateTeacherResignationValidation),
  TeacherResignationController.updateTeacherResignationById,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.teachers.teacherResignation.delete),
  TeacherResignationController.deleteTeacherResignationById,
);

export const TeacherResignationRoutes = router;