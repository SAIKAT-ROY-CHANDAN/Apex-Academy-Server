import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsiteHeadOfDepartmentService } from './websiteHeadOfDepartment.service';

const createWebsiteHeadOfDepartment = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.hod_image?.[0]
    ? getSingleImageUrl(req, files.hod_image[0])
    : null;

  if (image) req.body.imageUrl = image;

  const response =
    await WebsiteHeadOfDepartmentService.createWebsiteHeadOfDepartmentIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Website head of department created successfully',
    data: response,
  });
});

const getAllWebsiteHeadOfDepartments = catchAsync(async (req, res) => {
  const response =
    await WebsiteHeadOfDepartmentService.getAllWebsiteHeadOfDepartmentsFromDB(
      req.query,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website heads of departments retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getWebsiteHeadOfDepartmentById = catchAsync(async (req, res) => {
  const response =
    await WebsiteHeadOfDepartmentService.getWebsiteHeadOfDepartmentByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website head of department retrieved successfully',
    data: response,
  });
});

const updateWebsiteHeadOfDepartment = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.hod_image?.[0]
    ? getSingleImageUrl(req, files.hod_image[0])
    : null;

  if (image) {
    req.body.imageUrl = image;
  } else if (req.body.removeImage === 'true') {
    req.body.imageUrl = null;
  }

  // This flag was only used to decide the above — strip it so it doesn't
  // get passed into Zod validation / Prisma as an unknown field.
  delete req.body.removeImage;

  const response =
    await WebsiteHeadOfDepartmentService.updateWebsiteHeadOfDepartmentFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website head of department updated successfully',
    data: response,
  });
});

const deleteWebsiteHeadOfDepartment = catchAsync(async (req, res) => {
  await WebsiteHeadOfDepartmentService.deleteWebsiteHeadOfDepartmentFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website head of department deleted successfully',
  });
});

export const WebsiteHeadOfDepartmentController = {
  createWebsiteHeadOfDepartment,
  getAllWebsiteHeadOfDepartments,
  getWebsiteHeadOfDepartmentById,
  updateWebsiteHeadOfDepartment,
  deleteWebsiteHeadOfDepartment,
};
