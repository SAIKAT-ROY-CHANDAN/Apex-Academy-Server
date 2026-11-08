import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { TeacherValidation } from './teacher.validation';
import { TeacherController } from './teacher.controller';
import { upload, processUploads } from '../../middlewares/multer';
import parseFormData from '../../middlewares/parseFormData';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  upload.fields([
    { name: 'academic_document', maxCount: 1 },
    { name: 'previous_institution_resign_letter', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'nid_front', maxCount: 1 },
    { name: 'nid_back', maxCount: 1 },
  ]),
  permission(permissions.teachers.teacher.create),
  parseFormData(['customSalaries']),
  processUploads,
  validation(TeacherValidation.createTeacherValidation),
  TeacherController.createTeacher,
);

router.post(
  '/login',
  validation(TeacherValidation.loginTeacherValidation),
  TeacherController.loginTeacher,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.teachers.teacher.view),
  TeacherController.getAllTeachers,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.teachers.teacher.view),
  TeacherController.getTeacherById,
);

router.get(
  '/:id/overview',
  auth(['administrator', 'teacher']),
  permission(permissions.teachers.teacher.view),
  TeacherController.getTeacherOverview,
);

router.put(
  '/:id',
  auth('administrator'),
  upload.fields([
    { name: 'academic_document', maxCount: 1 },
    { name: 'previous_institution_resign_letter', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
    { name: 'nid_front', maxCount: 1 },
    { name: 'nid_back', maxCount: 1 },
  ]),
  permission(permissions.teachers.teacher.edit),
  parseFormData(['customSalaries']),
  processUploads,
  validation(TeacherValidation.updateTeacherValidation),
  TeacherController.updateTeacherById,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.teachers.teacher.delete),
  TeacherController.deleteTeacherById,
);

export const TeacherRoutes = router;
