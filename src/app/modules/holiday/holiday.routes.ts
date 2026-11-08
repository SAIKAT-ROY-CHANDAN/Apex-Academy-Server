import { Router } from 'express';
import { HolidayController } from './holiday.controller';
import validation from '../../middlewares/validation';
import { HolidayValidation } from './holiday.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.settings.holiday.create),
  validation(HolidayValidation.createHolidayValidation),
  HolidayController.createHoliday,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.settings.holiday.view),
  HolidayController.getAllHolidays,
);

router.get(
  '/calendar',
  auth(['administrator', 'teacher']),
  HolidayController.getCalendarHolidays,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.settings.holiday.view),
  HolidayController.getHolidayById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.settings.holiday.edit),
  validation(HolidayValidation.updateHolidayValidation),
  HolidayController.updateHoliday,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.settings.holiday.delete),
  HolidayController.deleteHoliday,
);

export const HolidayRoutes = router;