import { Router } from 'express';
import auth from '../../middlewares/auth';

import { HostelDashboardSummaryController } from './hostelDashboardSummary.controller';

const router = Router();

router.get(
  '/',
  auth('administrator'),
  //   permission(permission.hostel.hostelDashboardSummary.view),
  HostelDashboardSummaryController.getHostelDashboardSummary,
);

export const HostelDashboardSummaryRoutes = router;
