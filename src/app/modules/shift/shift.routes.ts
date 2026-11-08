import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { ShiftValidation } from './shift.validation';
import { ShiftController } from './shift.controller';

const router = Router();

router.post(
  '/',
  auth("administrator"),
  permission(permissions.academics.shift.manage),
  validation(ShiftValidation.createShiftValidation),
  ShiftController.createShift,
);

router.get(
  '/',
  auth("administrator"),
  permission(permissions.academics.shift.manage),
  ShiftController.getAllShifts,
);

router.get(
  '/:id',
  auth("administrator"),
  permission(permissions.academics.shift.manage),
  ShiftController.getShiftById,
);

router.put(
  '/:id',
  auth("administrator"),
  permission(permissions.academics.shift.manage),
  validation(ShiftValidation.updateShiftValidation),
  ShiftController.updateShift,
);

router.delete(
  '/:id',
  auth("administrator"),
  permission(permissions.academics.shift.manage),
  ShiftController.deleteShift,
);

export const ShiftRoutes = router;