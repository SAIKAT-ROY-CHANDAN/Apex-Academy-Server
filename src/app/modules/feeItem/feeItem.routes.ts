import { Router } from 'express';
import { FeeItemController } from './feeItem.controller';
import validation from '../../middlewares/validation';
import { FeeItemValidation } from './feeItem.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.academics.feeItem.create),
  validation(FeeItemValidation.createFeeItemValidation),
  FeeItemController.createFeeItem,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.academics.feeItem.view),
  FeeItemController.getAllFeeItems,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.feeItem.view),
  FeeItemController.getFeeItemById,
);
router.get(
  '/fee-type/:id',
  auth('administrator'),
  permission(permissions.academics.feeItem.view),
  FeeItemController.getFeeItemByFeeTypeId,
);
router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.feeItem.edit),
  validation(FeeItemValidation.updateFeeItemValidation),
  FeeItemController.updateFeeItem,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.feeItem.delete),
  FeeItemController.deleteFeeItem,
);


export const FeeItemRoutes = router;