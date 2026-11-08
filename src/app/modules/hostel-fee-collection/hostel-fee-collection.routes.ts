import { Router } from 'express';
import { HostelFeeCollectionController } from './hostel-fee-collection.controller';
import validation from '../../middlewares/validation';
import { HostelFeeCollectionValidation } from './hostel-fee-collection.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.hostel.hostelFeeCollection.create),
  validation(HostelFeeCollectionValidation.createHostelFeeCollectionValidation),
  HostelFeeCollectionController.createHostelFeeCollection,
);

router.post(
  '/pay-due',
  auth('administrator'),
  permission(permissions.hostel.hostelFeeCollection.create),
  validation(HostelFeeCollectionValidation.payHostelDueValidation),
  HostelFeeCollectionController.payHostelDue,
);

router.get(
  '/',
  auth('administrator'),
  permission(permissions.hostel.hostelFeeCollection.view),
  HostelFeeCollectionController.getAllHostelFeeCollections,
);

router.get(
  '/student-due/:studentId',
  auth('administrator'),
  permission(permissions.hostel.hostelFeeCollection.view),
  HostelFeeCollectionController.getStudentHostelDue,
);

router.get(
  '/my-due',
  auth('student'),
  HostelFeeCollectionController.getMyHostelDue,
);

router.post(
  '/bkash/initiate',
  auth('student'),
  HostelFeeCollectionController.initiateBkashPayment,
);

router.post(
  '/bkash/execute',
  auth('student'),
  validation(HostelFeeCollectionValidation.bkashExecuteValidation),
  HostelFeeCollectionController.executeBkashPayment,
);

router.get(
  '/bkash/query-status/:paymentID',
  auth('administrator'),
  permission(permissions.hostel.hostelFeeCollection.view),
  HostelFeeCollectionController.queryBkashPaymentStatus,
);

router.get(
  '/:id',
  auth('administrator'),
  permission(permissions.hostel.hostelFeeCollection.view),
  HostelFeeCollectionController.getHostelFeeCollectionById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.hostel.hostelFeeCollection.edit),
  validation(HostelFeeCollectionValidation.updateHostelFeeCollectionValidation),
  HostelFeeCollectionController.updateHostelFeeCollection,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.hostel.hostelFeeCollection.delete),
  HostelFeeCollectionController.deleteHostelFeeCollection,
);

export const HostelFeeCollectionRoutes = router;
