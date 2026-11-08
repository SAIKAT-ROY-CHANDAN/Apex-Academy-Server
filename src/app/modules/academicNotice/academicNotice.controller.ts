import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSinglePdfUrl } from '../../utils/getUrl';
import { AcademicNoticeService } from './academicNotice.service';

const createAcademicNotice = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const pdfUrl = files?.pdf_file?.[0]
    ? getSinglePdfUrl(req, files.pdf_file[0])
    : null;

  if (pdfUrl) req.body.pdfUrl = pdfUrl;

  // strip helper flag if present (allowed through validation)
  if (req.body.removePdf) delete req.body.removePdf;

  const response =
    await AcademicNoticeService.createAcademicNoticeIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Academic notice created successfully',
    data: response,
  });
});

const getAllAcademicNotices = catchAsync(async (req, res) => {
  const response =
    await AcademicNoticeService.getAllAcademicNoticesFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic notices retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getAcademicNoticeById = catchAsync(async (req, res) => {
  const response =
    await AcademicNoticeService.getAcademicNoticeByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic notice retrieved successfully',
    data: response,
  });
});

const updateAcademicNotice = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const pdfUrl = files?.pdf_file?.[0]
    ? getSinglePdfUrl(req, files.pdf_file[0])
    : null;

  if (pdfUrl) {
    req.body.pdfUrl = pdfUrl;
  } else if (req.body.removePdf === 'true') {
    req.body.pdfUrl = null;
  }

  delete req.body.removePdf;

  const response = await AcademicNoticeService.updateAcademicNoticeFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic notice updated successfully',
    data: response,
  });
});

const deleteAcademicNotice = catchAsync(async (req, res) => {
  await AcademicNoticeService.deleteAcademicNoticeFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic notice deleted successfully',
  });
});

export const AcademicNoticeController = {
  createAcademicNotice,
  getAllAcademicNotices,
  getAcademicNoticeById,
  updateAcademicNotice,
  deleteAcademicNotice,
};
