import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { examConfigValidation } from './examConfig.validation';
import { examConfigController } from './examConfig.controller';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  validation(examConfigValidation.create),
  permission(permissions.academics.examConfig.create),
  examConfigController.createExamConfig,
);

router.get(
  '/',
  auth(['administrator','teacher']),
  permission(permissions.academics.examConfig.view),
  examConfigController.getAllExamConfigs,
);

router.get(
  '/years',
  auth(['administrator','teacher']),
  permission(permissions.academics.examConfig.view),
  examConfigController.getExamYears,
);

router.get(
  '/options',
  auth(['administrator','teacher']),
  permission(permissions.academics.examConfig.view),
  examConfigController.getExamOptions,
);

router.get(
  '/:id',
  auth(['administrator','teacher']),
  permission(permissions.academics.examConfig.view),
  examConfigController.getExamConfigById,
);

router.patch(
  '/:id',
  auth('administrator'),
  validation(examConfigValidation.update),
  permission(permissions.academics.examConfig.edit),
  examConfigController.updateExamConfig,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.examConfig.delete),
  examConfigController.deleteExamConfig,
);

export const ExamConfigRoutes = router;