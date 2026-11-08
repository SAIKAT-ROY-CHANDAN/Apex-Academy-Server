import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { OvertimeStaffConfigValidation } from './overtimeStaffConfig.validation';
import { OvertimeStaffConfigController } from './overtimeStaffConfig.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.academics.overtimeStaffConfig.create),
  validation(OvertimeStaffConfigValidation.createOvertimeStaffConfigValidation),
  OvertimeStaffConfigController.createOvertimeStaffConfig,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.academics.overtimeStaffConfig.view),
  OvertimeStaffConfigController.getAllOvertimeStaffConfigs,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.overtimeStaffConfig.view),
  OvertimeStaffConfigController.getOvertimeStaffConfigById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.overtimeStaffConfig.edit),
  validation(OvertimeStaffConfigValidation.updateOvertimeStaffConfigValidation),
  OvertimeStaffConfigController.updateOvertimeStaffConfigById,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.overtimeStaffConfig.delete),
  OvertimeStaffConfigController.deleteOvertimeStaffConfigById,
);

export const OvertimeStaffConfigRoutes = router;
