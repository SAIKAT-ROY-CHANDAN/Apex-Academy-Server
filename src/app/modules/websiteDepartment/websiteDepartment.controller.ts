import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsiteDepartmentService } from './websiteDepartment.service';

const createWebsiteDepartment = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.department_image?.[0]
    ? getSingleImageUrl(req, files.department_image[0])
    : null;

  if (image) req.body.imageUrl = image;

  const response = await WebsiteDepartmentService.createWebsiteDepartmentIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Website department created successfully',
    data: response,
  });
});

const getAllWebsiteDepartments = catchAsync(async (req, res) => {
  const response =
    await WebsiteDepartmentService.getAllWebsiteDepartmentsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website departments retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getWebsiteDepartmentById = catchAsync(async (req, res) => {
  const response =
    await WebsiteDepartmentService.getWebsiteDepartmentByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website department retrieved successfully',
    data: response,
  });
});

const updateWebsiteDepartment = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.department_image?.[0]
    ? getSingleImageUrl(req, files.department_image[0])
    : null;

  if (image) {
    req.body.imageUrl = image;
  } else if (req.body.removeImage === 'true') {
    req.body.imageUrl = null;
  }

  // This flag was only used to decide the above — strip it so it doesn't
  // get passed into Zod validation / Prisma as an unknown field.
  delete req.body.removeImage;

  const response = await WebsiteDepartmentService.updateWebsiteDepartmentFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website department updated successfully',
    data: response,
  });
});

const deleteWebsiteDepartment = catchAsync(async (req, res) => {
  await WebsiteDepartmentService.deleteWebsiteDepartmentFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website department deleted successfully',
  });
});

export const WebsiteDepartmentController = {
  createWebsiteDepartment,
  getAllWebsiteDepartments,
  getWebsiteDepartmentById,
  updateWebsiteDepartment,
  deleteWebsiteDepartment,
};
