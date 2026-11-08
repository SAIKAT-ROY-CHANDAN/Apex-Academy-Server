import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsiteJobCircularService } from './websiteJobCircular.service';

const createWebsiteJobCircular = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.job_image?.[0]
    ? getSingleImageUrl(req, files.job_image[0])
    : null;

  if (image) req.body.imageUrl = image;

  const response = await WebsiteJobCircularService.createWebsiteJobCircularIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Website job circular created successfully',
    data: response,
  });
});

const getAllWebsiteJobCirculars = catchAsync(async (req, res) => {
  const response =
    await WebsiteJobCircularService.getAllWebsiteJobCircularsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website job circulars retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getWebsiteJobCircularById = catchAsync(async (req, res) => {
  const response =
    await WebsiteJobCircularService.getWebsiteJobCircularByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website job circular retrieved successfully',
    data: response,
  });
});

const updateWebsiteJobCircular = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.job_image?.[0]
    ? getSingleImageUrl(req, files.job_image[0])
    : null;

  if (image) {
    req.body.imageUrl = image;
  } else if (req.body.removeImage === 'true') {
    req.body.imageUrl = null;
  }

  // This flag was only used to decide the above — strip it so it doesn't
  // get passed into Zod validation / Prisma as an unknown field.
  delete req.body.removeImage;

  const response = await WebsiteJobCircularService.updateWebsiteJobCircularFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website job circular updated successfully',
    data: response,
  });
});

const deleteWebsiteJobCircular = catchAsync(async (req, res) => {
  await WebsiteJobCircularService.deleteWebsiteJobCircularFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website job circular deleted successfully',
  });
});

export const WebsiteJobCircularController = {
  createWebsiteJobCircular,
  getAllWebsiteJobCirculars,
  getWebsiteJobCircularById,
  updateWebsiteJobCircular,
  deleteWebsiteJobCircular,
};
