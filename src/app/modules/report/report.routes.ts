import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { reportController } from './report.controller';

const router = Router();

router.get(
  '/overview',
  auth('administrator'),
  permission(permissions.finance.expense.view),
  reportController.getAllFinanceReportsOverview,
);

router.get(
  '/expenses',
  auth('administrator'),
  permission(permissions.finance.expense.view),
  reportController.getOrganizationalExpensesReport,
);

router.get(
  '/income',
  auth('administrator'),
  permission(permissions.finance.deposit.view),
  reportController.getOrganizationalIncomeReport,
);

router.get(
  '/student-collections',
  auth('administrator'),
  permission(permissions.finance.expense.view),
  reportController.getStudentCollectionReport,
);

router.get(
  '/student-due',
  auth('administrator'),
  permission(permissions.finance.expense.view),
  reportController.getStudentDueReport,
);


export const ReportRoutes = router;
