import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { depositTypeValidation } from './depositType.validation';
import { depositTypeController } from './depositType.controller';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  validation(depositTypeValidation.create),
  permission(permissions.finance.depositType.create),
  depositTypeController.createDepositType,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.finance.depositType.view),
  depositTypeController.getAllDepositTypes,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.finance.depositType.view),
  depositTypeController.getDepositTypeById,
);

router.patch(
  '/:id',
  auth('administrator'),
  validation(depositTypeValidation.update),
  permission(permissions.finance.depositType.edit),
  depositTypeController.updateDepositType,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.finance.depositType.delete),
  depositTypeController.deleteDepositType,
);

export const DepositTypeRoutes = router;