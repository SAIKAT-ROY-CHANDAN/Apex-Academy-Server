import { Router } from 'express';
import { HostelExpenseController } from './hostel-expense.controller';
import validation from '../../middlewares/validation';
import { HostelExpenseValidation } from './hostel-expense.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.hostel.hostelExpense.create),
  validation(HostelExpenseValidation.createHostelExpenseValidation),
  HostelExpenseController.createHostelExpense,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.hostel.hostelExpense.view),
  HostelExpenseController.getAllHostelExpenses,
);

router.get(
  '/due-report',
  auth('administrator'),
  permission(permissions.hostel.hostelExpense.view),
  HostelExpenseController.getHostelStudentsDueReport,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.hostel.hostelExpense.view),
  HostelExpenseController.getHostelExpenseById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.hostel.hostelExpense.edit),
  validation(HostelExpenseValidation.updateHostelExpenseValidation),
  HostelExpenseController.updateHostelExpense,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.hostel.hostelExpense.delete),
  HostelExpenseController.deleteHostelExpense,
);

export const HostelExpenseRoutes = router;
