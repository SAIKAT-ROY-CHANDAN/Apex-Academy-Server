import { Router } from 'express';
import { DepartmentController } from './department.controller';
import validation from '../../middlewares/validation';
import { DepartmentValidation } from './department.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.academics.department.create),
  validation(DepartmentValidation.createDepartmentValidation),
  DepartmentController.createDepartment,
);

router.get(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.department.view),
  DepartmentController.getAllDepartments,
);
router.get(
  '/program/:programId',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.department.view),
  DepartmentController.getDepartmentsByProgramId,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.department.view),
  DepartmentController.getDepartmentById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.department.edit),
  validation(DepartmentValidation.updateDepartmentValidation),
  DepartmentController.updateDepartment,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.department.delete),
  DepartmentController.deleteDepartment,
);

export const DepartmentRoutes = router;
