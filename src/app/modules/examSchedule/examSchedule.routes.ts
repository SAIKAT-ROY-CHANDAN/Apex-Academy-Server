import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { examScheduleValidation } from './examSchedule.validation';
import { examScheduleController } from './examSchedule.controller';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  validation(examScheduleValidation.create),
  permission(permissions.academics.examSchedule.create),
  examScheduleController.createExamSchedule,
);

router.get(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.examSchedule.view),
  examScheduleController.getAllExamSchedules,
);

router.get(
  '/subjects',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.examSchedule.view),
  examScheduleController.getSubjectsWithScheduledExam,
);

router.get(
  '/exam-configs',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.examSchedule.view),
  examScheduleController.getExamConfigsWithScheduledExam,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.examSchedule.view),
  examScheduleController.getExamScheduleById,
);

router.patch(
  '/:id',
  auth('administrator'),
  validation(examScheduleValidation.update),
  permission(permissions.academics.examSchedule.edit),
  examScheduleController.updateExamSchedule,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.examSchedule.delete),
  examScheduleController.deleteExamSchedule,
);

export const ExamScheduleRoutes = router;