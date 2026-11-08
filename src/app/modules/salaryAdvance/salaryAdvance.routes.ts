import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { SalaryAdvanceValidation } from './salaryAdvance.validation';
import { SalaryAdvanceController } from './salaryAdvance.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.teachers.salaryAdvance.create),
  validation(SalaryAdvanceValidation.createSalaryAdvanceValidation),
  SalaryAdvanceController.createSalaryAdvance,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.teachers.salaryAdvance.view),
  SalaryAdvanceController.getAllSalaryAdvances,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.teachers.salaryAdvance.view),
  SalaryAdvanceController.getSalaryAdvanceById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.teachers.salaryAdvance.edit),
  validation(SalaryAdvanceValidation.updateSalaryAdvanceValidation),
  SalaryAdvanceController.updateSalaryAdvanceById,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.teachers.salaryAdvance.delete),
  SalaryAdvanceController.deleteSalaryAdvanceById,
);

export const SalaryAdvanceRoutes = router;