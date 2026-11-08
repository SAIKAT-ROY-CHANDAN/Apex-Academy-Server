import { Router } from 'express';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';
import { DashboardController } from './dashboard.controller';

const router = Router();

router.get(
  '/overview',
  auth('administrator'),
  permission(permissions.students.student.view),
  DashboardController.getDashboardOverview,
);

export const DashboardRoutes = router;