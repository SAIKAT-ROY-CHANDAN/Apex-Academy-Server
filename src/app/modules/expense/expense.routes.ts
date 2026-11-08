import { Router } from 'express';
import auth from '../../middlewares/auth';
import validation from '../../middlewares/validation';
import { expenseValidation } from './expense.validation';
import { expenseController } from './expense.controller';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  validation(expenseValidation.create),
  permission(permissions.finance.expense.create),
  expenseController.createExpense,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.finance.expense.view),
  expenseController.getAllExpenses,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.finance.expense.view),
  expenseController.getExpenseById,
);

router.patch(
  '/:id',
  auth('administrator'),
  validation(expenseValidation.update),
  permission(permissions.finance.expense.edit),
  expenseController.updateExpense,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.finance.expense.delete),
  expenseController.deleteExpense,
);

export const ExpenseRoutes = router;