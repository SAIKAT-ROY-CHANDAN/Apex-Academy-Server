import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { CareerDevelopmentsService } from './careerDevelopments.service';

const createCareerDevelopments = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.career_image?.[0]
    ? getSingleImageUrl(req, files.career_image[0])
    : null;

  if (image) req.body.imageUrl = image;

  const response =
    await CareerDevelopmentsService.createCareerDevelopmentsIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Career development created successfully',
    data: response,
  });
});

const getAllCareerDevelopments = catchAsync(async (req, res) => {
  const response =
    await CareerDevelopmentsService.getAllCareerDevelopmentsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Career developments retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getActiveCareerDevelopments = catchAsync(async (req, res) => {
  const response =
    await CareerDevelopmentsService.getActiveCareerDevelopmentsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Active career developments retrieved successfully',
    data: response,
  });
});

const getCareerDevelopmentsById = catchAsync(async (req, res) => {
  const response =
    await CareerDevelopmentsService.getCareerDevelopmentsByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Career development retrieved successfully',
    data: response,
  });
});

const updateCareerDevelopments = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.career_image?.[0]
    ? getSingleImageUrl(req, files.career_image[0])
    : null;

  if (image) {
    req.body.imageUrl = image;
  } else if (req.body.removeImage === 'true') {
    req.body.imageUrl = null;
  }

  delete req.body.removeImage;

  const response =
    await CareerDevelopmentsService.updateCareerDevelopmentsFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Career development updated successfully',
    data: response,
  });
});

const deleteCareerDevelopments = catchAsync(async (req, res) => {
  await CareerDevelopmentsService.deleteCareerDevelopmentsFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Career development deleted successfully',
  });
});

export const CareerDevelopmentsController = {
  createCareerDevelopments,
  getAllCareerDevelopments,
  getActiveCareerDevelopments,
  getCareerDevelopmentsById,
  updateCareerDevelopments,
  deleteCareerDevelopments,
};