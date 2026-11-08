import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { AcademicTuitionService } from './academicTuition.service';

const createAcademicTuition = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const tuitionUrl = files?.tuition_image?.[0]
    ? getSingleImageUrl(req, files.tuition_image[0])
    : null;

  if (tuitionUrl) req.body.tuitionUrl = tuitionUrl;

  if (req.body.removeTuitionImage) delete req.body.removeTuitionImage;

  const response =
    await AcademicTuitionService.createAcademicTuitionIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Academic tuition created successfully',
    data: response,
  });
});

const getAllAcademicTuitions = catchAsync(async (req, res) => {
  const response =
    await AcademicTuitionService.getAllAcademicTuitionsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic tuitions retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getAcademicTuitionById = catchAsync(async (req, res) => {
  const response = await AcademicTuitionService.getAcademicTuitionByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic tuition retrieved successfully',
    data: response,
  });
});

const updateAcademicTuition = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const tuitionUrl = files?.tuition_image?.[0]
    ? getSingleImageUrl(req, files.tuition_image[0])
    : null;

  if (tuitionUrl) {
    req.body.tuitionUrl = tuitionUrl;
  } else if (req.body.removeTuitionImage === 'true') {
    req.body.tuitionUrl = null;
  }

  delete req.body.removeTuitionImage;

  const response = await AcademicTuitionService.updateAcademicTuitionFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic tuition updated successfully',
    data: response,
  });
});

const deleteAcademicTuition = catchAsync(async (req, res) => {
  await AcademicTuitionService.deleteAcademicTuitionFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic tuition deleted successfully',
  });
});

export const AcademicTuitionController = {
  createAcademicTuition,
  getAllAcademicTuitions,
  getAcademicTuitionById,
  updateAcademicTuition,
  deleteAcademicTuition,
};
