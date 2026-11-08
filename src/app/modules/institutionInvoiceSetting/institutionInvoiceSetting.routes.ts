import { Router } from 'express';
import { InstitutionInvoiceSettingController } from './institutionInvoiceSetting.controller';
import validation from '../../middlewares/validation';
import { InstitutionInvoiceSettingValidation } from './institutionInvoiceSetting.validation';
import auth from '../../middlewares/auth';
// import { permission } from '../../middlewares/permission';
// import { permissions } from '../../constant/permissions';
import { processUploads, upload } from '../../middlewares/multer';

const router = Router();

router.post(
  '/',
  auth('administrator'),
  // permission(permissions.settings.institutionInvoiceSetting.create),
  upload.fields([
    { name: 'watermark', maxCount: 1 },
    { name: 'header', maxCount: 1 },
    { name: 'footer', maxCount: 1 },
  ]),
  processUploads,
  validation(InstitutionInvoiceSettingValidation.createInstitutionInvoiceSettingValidation),
  InstitutionInvoiceSettingController.createInstitutionInvoiceSetting,
);

router.get(
  '/',
  auth('administrator'),
  // permission(permissions.settings.institutionInvoiceSetting.view),
  InstitutionInvoiceSettingController.getAllInstitutionInvoiceSettings,
);

router.get(
  '/:id',
  auth('administrator'),
  // permission(permissions.settings.institutionInvoiceSetting.view),
  InstitutionInvoiceSettingController.getInstitutionInvoiceSettingById,
);

router.put(
  '/:id',
  auth('administrator'),
  // permission(permissions.settings.institutionInvoiceSetting.edit),
  upload.fields([
    { name: 'watermark', maxCount: 1 },
    { name: 'header', maxCount: 1 },
    { name: 'footer', maxCount: 1 },
  ]),
  processUploads,
  validation(InstitutionInvoiceSettingValidation.updateInstitutionInvoiceSettingValidation),
  InstitutionInvoiceSettingController.updateInstitutionInvoiceSetting,
);

router.delete(
  '/:id',
  auth('administrator'),
  // permission(permissions.settings.institutionInvoiceSetting.delete),
  InstitutionInvoiceSettingController.deleteInstitutionInvoiceSetting,
);

export const InstitutionInvoiceSettingRoutes = router;
