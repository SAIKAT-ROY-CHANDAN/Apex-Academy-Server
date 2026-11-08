import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { admitCardLogValidation } from './admitCardLog.validation';
import { admitCardLogController } from './admitCardLog.controller';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  validation(admitCardLogValidation.create),
  permission(permissions.students.admitCardLog.create),
  admitCardLogController.createAdmitCardLog,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.students.admitCardLog.view),
  admitCardLogController.getAllAdmitCardLogs,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.students.admitCardLog.view),
  admitCardLogController.getAdmitCardLogById,
);

router.patch(
  '/:id',
  auth('administrator'),
  validation(admitCardLogValidation.update),
  permission(permissions.students.admitCardLog.edit),
  admitCardLogController.updateAdmitCardLog,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.students.admitCardLog.delete),
  admitCardLogController.deleteAdmitCardLog,
);

export const AdmitCardLogRoutes = router;