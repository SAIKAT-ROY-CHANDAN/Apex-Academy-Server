import { Router } from 'express';
import { IDCardGenerateLogController } from './idCardGenerateLog.controller';
import validation from '../../middlewares/validation';
import { IDCardGenerateLogValidation } from './idCardGenerateLog.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.students.idCardGenerateLog.create),
  validation(IDCardGenerateLogValidation.createIDCardGenerateLogValidation),
  IDCardGenerateLogController.createIDCardGenerateLog,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.students.idCardGenerateLog.view),
  IDCardGenerateLogController.getAllIDCardGenerateLogs,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.students.idCardGenerateLog.view),
  IDCardGenerateLogController.getIDCardGenerateLogById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.students.idCardGenerateLog.edit),
  validation(IDCardGenerateLogValidation.updateIDCardGenerateLogValidation),
  IDCardGenerateLogController.updateIDCardGenerateLog,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.students.idCardGenerateLog.delete),
  IDCardGenerateLogController.deleteIDCardGenerateLog,
);

export const IDCardGenerateLogRoutes = router;