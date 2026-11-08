import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { depositValidation } from './deposit.validation';
import { depositController } from './deposit.controller';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  validation(depositValidation.create),
  permission(permissions.finance.deposit.create),
  depositController.createDeposit,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.finance.deposit.view),
  depositController.getAllDeposits,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.finance.deposit.view),
  depositController.getDepositById,
);

router.patch(
  '/:id',
  auth('administrator'),
  validation(depositValidation.update),
  permission(permissions.finance.deposit.edit),
  depositController.updateDeposit,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.finance.deposit.delete),
  depositController.deleteDeposit,
);

export const DepositRoutes = router;