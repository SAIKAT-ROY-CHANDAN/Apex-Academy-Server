import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsiteHistoricalOutlineService } from './websiteHistoricalOutline.service';

const IMAGE_FIELDS = [
  'outline_image_1',
  'outline_image_2',
  'outline_image_3',
] as const;

const createWebsiteHistoricalOutline = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  IMAGE_FIELDS.forEach((field, index) => {
    const file = files?.[field]?.[0];
    const key = `imageUrl${index + 1}`;
    if (file) {
      req.body[key] = getSingleImageUrl(req, file);
    }
  });

  const response =
    await WebsiteHistoricalOutlineService.createWebsiteHistoricalOutlineIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Website historical outline section created successfully',
    data: response,
  });
});

const getWebsiteHistoricalOutline = catchAsync(async (req, res) => {
  const response =
    await WebsiteHistoricalOutlineService.getWebsiteHistoricalOutlineFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website historical outline section retrieved successfully',
    data: response,
  });
});

const getWebsiteHistoricalOutlineById = catchAsync(async (req, res) => {
  const response =
    await WebsiteHistoricalOutlineService.getWebsiteHistoricalOutlineByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website historical outline section retrieved successfully',
    data: response,
  });
});

const updateWebsiteHistoricalOutline = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  IMAGE_FIELDS.forEach((field, index) => {
    const file = files?.[field]?.[0];
    const key = `imageUrl${index + 1}`;
    if (file) {
      req.body[key] = getSingleImageUrl(req, file);
    } else if (req.body[`removeImage${index + 1}`] === 'true') {
      req.body[key] = null;
    }
    // This flag was only used to decide the above — strip it so it doesn't
    // get passed into Zod validation / Prisma as an unknown field.
    delete req.body[`removeImage${index + 1}`];
  });

  const response =
    await WebsiteHistoricalOutlineService.updateWebsiteHistoricalOutlineFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website historical outline section updated successfully',
    data: response,
  });
});

const deleteWebsiteHistoricalOutline = catchAsync(async (req, res) => {
  await WebsiteHistoricalOutlineService.deleteWebsiteHistoricalOutlineFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website historical outline section deleted successfully',
  });
});

export const WebsiteHistoricalOutlineController = {
  createWebsiteHistoricalOutline,
  getWebsiteHistoricalOutline,
  getWebsiteHistoricalOutlineById,
  updateWebsiteHistoricalOutline,
  deleteWebsiteHistoricalOutline,
};
