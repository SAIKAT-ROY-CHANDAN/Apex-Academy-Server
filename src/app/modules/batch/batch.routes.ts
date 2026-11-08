import { Router } from 'express';
import { BatchController } from './batch.controller';
import validation from '../../middlewares/validation';
import { BatchValidation } from './batch.validation';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import { permissions } from '../../constant/permissions';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  permission(permissions.academics.batch.create),
  validation(BatchValidation.createBatchValidation),
  BatchController.createBatch,
);

router.get(
  '/',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.batch.view),
  BatchController.getAllBatches,
);

router.get(
  '/:id',
  auth(['administrator', 'teacher']),
  permission(permissions.academics.batch.view),
  BatchController.getBatchById,
);

router.put(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.batch.edit),
  validation(BatchValidation.updateBatchValidation),
  BatchController.updateBatch,
);

router.delete(
  '/:id',
  auth('administrator'),
  permission(permissions.academics.batch.delete),
  BatchController.deleteBatch,
);

export const BatchRoutes = router;