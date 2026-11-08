import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { InstitutionInvoiceSettingService } from './institutionInvoiceSetting.service';

const createInstitutionInvoiceSetting = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const watermark = files?.watermark?.[0]
    ? getSingleImageUrl(req, files.watermark[0])
    : null;
  const header = files?.header?.[0]
    ? getSingleImageUrl(req, files.header[0])
    : null;
  const footer = files?.footer?.[0]
    ? getSingleImageUrl(req, files.footer[0])
    : null;

  if (watermark) req.body.watermarkUrl = watermark;
  if (header) req.body.headerUrl = header;
  if (footer) req.body.footerUrl = footer;

  const response =
    await InstitutionInvoiceSettingService.createInstitutionInvoiceSettingIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Institution invoice setting created successfully',
    data: response,
  });
});

const getAllInstitutionInvoiceSettings = catchAsync(async (req, res) => {
  const response =
    await InstitutionInvoiceSettingService.getAllInstitutionInvoiceSettingsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Institution invoice settings retrieved successfully',
    data: response,
  });
});

const getInstitutionInvoiceSettingById = catchAsync(async (req, res) => {
  const response =
    await InstitutionInvoiceSettingService.getInstitutionInvoiceSettingByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Institution invoice setting retrieved successfully',
    data: response,
  });
});

const updateInstitutionInvoiceSetting = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const watermark = files?.watermark?.[0]
    ? getSingleImageUrl(req, files.watermark[0])
    : null;
  const header = files?.header?.[0]
    ? getSingleImageUrl(req, files.header[0])
    : null;
  const footer = files?.footer?.[0]
    ? getSingleImageUrl(req, files.footer[0])
    : null;

  if (watermark) {
    req.body.watermarkUrl = watermark;
  } else if (req.body.removeWatermark === 'true') {
    req.body.watermarkUrl = null;
  }

  if (header) {
    req.body.headerUrl = header;
  } else if (req.body.removeHeader === 'true') {
    req.body.headerUrl = null;
  }

  if (footer) {
    req.body.footerUrl = footer;
  } else if (req.body.removeFooter === 'true') {
    req.body.footerUrl = null;
  }

  // These flags were only used to decide the above — strip them so they
  // don't get passed into Zod validation / Prisma as unknown fields.
  delete req.body.removeWatermark;
  delete req.body.removeHeader;
  delete req.body.removeFooter;

  const response =
    await InstitutionInvoiceSettingService.updateInstitutionInvoiceSettingFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Institution invoice setting updated successfully',
    data: response,
  });
});

const deleteInstitutionInvoiceSetting = catchAsync(async (req, res) => {
  await InstitutionInvoiceSettingService.deleteInstitutionInvoiceSettingFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Institution invoice setting deleted successfully',
  });
});

export const InstitutionInvoiceSettingController = {
  createInstitutionInvoiceSetting,
  getAllInstitutionInvoiceSettings,
  getInstitutionInvoiceSettingById,
  updateInstitutionInvoiceSetting,
  deleteInstitutionInvoiceSetting,
};
