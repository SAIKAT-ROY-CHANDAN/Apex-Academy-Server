import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { OvertimeTeacherConfigValidation } from './overtimeTeacherConfig.validation';
import { OvertimeTeacherConfigController } from './overtimeTeacherConfig.controller';

const router = Router();

router.post(
  '/',
  auth("administrator"),
  permission(permissions.academics.overtimeTeacherConfig.create),
  validation(
    OvertimeTeacherConfigValidation.createOvertimeTeacherConfigValidation,
  ),
  OvertimeTeacherConfigController.createOvertimeTeacherConfig,
);

router.get(
  '/',
  auth("administrator"),
  permission(permissions.academics.overtimeTeacherConfig.view),
  OvertimeTeacherConfigController.getAllOvertimeTeacherConfigs,
);

router.get(
  '/:id',
  auth("administrator"),
  permission(permissions.academics.overtimeTeacherConfig.view),
  OvertimeTeacherConfigController.getOvertimeTeacherConfigById,
);

router.put(
  '/:id',
  auth("administrator"),
  permission(permissions.academics.overtimeTeacherConfig.edit),
  validation(
    OvertimeTeacherConfigValidation.updateOvertimeTeacherConfigValidation,
  ),
  OvertimeTeacherConfigController.updateOvertimeTeacherConfigById,
);

router.delete(
  '/:id',
  auth("administrator"),
  permission(permissions.academics.overtimeTeacherConfig.delete),
  OvertimeTeacherConfigController.deleteOvertimeTeacherConfigById,
);

export const OvertimeTeacherConfigRoutes = router;