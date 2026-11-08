import { Router } from 'express';
import { DueFeeController } from './dueFee.controller';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.get(
  '/export',
  auth('administrator'),
  permission(permissions.students.studentFee.view),
  DueFeeController.exportDueFees,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.students.studentFee.view),
  DueFeeController.getAllDueFees,
);

export const DueFeeRoutes = router;
