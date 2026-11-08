import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { expenseTypeValidation } from './expenseType.validation';
import { expenseTypeController } from './expenseType.controller';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  validation(expenseTypeValidation.create),
  permission(permissions.finance.expenseType.create),
  expenseTypeController.createExpenseType,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.finance.expenseType.view),
  expenseTypeController.getAllExpenseTypes,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.finance.expenseType.view),
  expenseTypeController.getExpenseTypeById,
);

router.patch(
  '/:id',
  auth('administrator'),
  validation(expenseTypeValidation.update),
  permission(permissions.finance.expenseType.edit),
  expenseTypeController.updateExpenseType,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.finance.expenseType.delete),
  expenseTypeController.deleteExpenseType,
);

export const ExpenseTypeRoutes = router;