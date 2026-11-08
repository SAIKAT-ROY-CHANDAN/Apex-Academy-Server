import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { periodSettingController } from './periodSetting.controller';
import { periodSettingValidation } from './periodSetting.validation';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

// Teachers need the period count and the period times to read their own
// schedule, so the read is shared with them. permission() is a no-op for
// teachers, and only the admin routes below can change the settings.
router.get(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.classRoutine.view),
  periodSettingController.getPeriodSetting,
);

router.post(
  '/',
  auth('administrator'),
  permission(permissions.academics.classRoutine.create),
  validation(periodSettingValidation.create),
  periodSettingController.createPeriodSetting,
);

router.patch(
  '/',
  auth('administrator'),
  permission(permissions.academics.classRoutine.edit),
  validation(periodSettingValidation.update),
  periodSettingController.updatePeriodSetting,
);

export const PeriodSettingRoutes = router;
