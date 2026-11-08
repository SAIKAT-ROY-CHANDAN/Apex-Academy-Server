import { Router } from 'express';
import { HostelAllocationController } from './hostel-allocation.controller';
import validation from '../../middlewares/validation';
import { HostelAllocationValidation } from './hostel-allocation.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.hostel.hostelAllocation.create),
  validation(HostelAllocationValidation.createHostelAllocationValidation),
  HostelAllocationController.createHostelAllocation,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.hostel.hostelAllocation.view),
  HostelAllocationController.getAllHostelAllocations,
);

router.get(
  '/allocated-students',
  auth('administrator'),
  permission(permissions.hostel.hostelAllocation.view),
  HostelAllocationController.getAllocatedHostelStudents,
);

router.get(
  '/student/:studentId/history',
  auth('administrator'),
  permission(permissions.hostel.hostelAllocation.view),
  HostelAllocationController.getStudentAllocationHistory,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.hostel.hostelAllocation.view),
  HostelAllocationController.getHostelAllocationById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.hostel.hostelAllocation.edit),
  validation(HostelAllocationValidation.updateHostelAllocationValidation),
  HostelAllocationController.updateHostelAllocation,
);

router.post(
  '/:id/checkout',
  auth('administrator'),
  permission(permissions.hostel.hostelAllocation.edit),
  HostelAllocationController.checkoutHostelAllocation,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.hostel.hostelAllocation.delete),
  HostelAllocationController.deleteHostelAllocation,
);

export const HostelAllocationRoutes = router;
