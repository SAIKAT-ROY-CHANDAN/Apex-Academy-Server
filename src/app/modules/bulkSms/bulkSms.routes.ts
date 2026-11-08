import { Router } from 'express';
import { permissions } from '../../constant/permissions';
import auth from '../../middlewares/auth';
import { permission } from '../../middlewares/permission';
import validation from '../../middlewares/validation';
import { BulkSmsController } from './bulkSms.controller';
import { BulkSmsValidation } from './bulkSms.validation';

const router = Router();

router.post(
  '/send',
  auth('administrator'),
  permission(permissions.communications.bulkSms.manage),
  validation(BulkSmsValidation.sendBulkSmsValidation),
  BulkSmsController.sendBulkSms,
);

export const BulkSmsRoutes = router;
