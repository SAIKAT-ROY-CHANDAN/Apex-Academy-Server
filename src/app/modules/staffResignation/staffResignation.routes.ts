import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import validation from '../../middlewares/validation';
import { StaffResignationValidation } from './staffResignation.validation';
import { StaffResignationController } from './staffResignation.controller';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.staff.staffResignation.create),
  validation(StaffResignationValidation.createStaffResignationValidation),
  StaffResignationController.createStaffResignation,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.staff.staffResignation.view),
  StaffResignationController.getAllStaffResignations,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staffResignation.view),
  StaffResignationController.getStaffResignationById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staffResignation.edit),
  validation(StaffResignationValidation.updateStaffResignationValidation),
  StaffResignationController.updateStaffResignationById,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.staff.staffResignation.delete),
  StaffResignationController.deleteStaffResignationById,
);

export const StaffResignationRoutes = router;
