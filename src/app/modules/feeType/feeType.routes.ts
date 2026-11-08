import { Router } from 'express';
import { FeeTypeController } from './feeType.controller';
import validation from '../../middlewares/validation';
import { FeeTypeValidation } from './feeType.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.academics.feeType.create),
  validation(FeeTypeValidation.createFeeTypeValidation),
  FeeTypeController.createFeeType,
);
router.get(
  '/feeManage',
  // auth('administrator'),
  // permission(permissions.academics.feeType.view),
  FeeTypeController.feeManage,
);
router.get(
  '/',
  auth('administrator'),
  permission(permissions.academics.feeType.view),
  FeeTypeController.getAllFeeTypes,
);
router.get(
  '/feeManage',
  auth('administrator'),
  permission(permissions.academics.feeType.view),
  FeeTypeController.feeManage,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.feeType.view),
  FeeTypeController.getFeeTypeById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.feeType.edit),
  validation(FeeTypeValidation.updateFeeTypeValidation),
  FeeTypeController.updateFeeType,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.feeType.delete),
  FeeTypeController.deleteFeeType,
);

export const FeeTypeRoutes = router;
