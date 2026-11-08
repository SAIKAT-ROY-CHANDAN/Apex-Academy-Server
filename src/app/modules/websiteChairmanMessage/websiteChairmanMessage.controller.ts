import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsiteChairmanMessageService } from './websiteChairmanMessage.service';

const createWebsiteChairmanMessage = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.chairman_image?.[0]
    ? getSingleImageUrl(req, files.chairman_image[0])
    : null;

  if (image) req.body.imageUrl = image;

  const response =
    await WebsiteChairmanMessageService.createWebsiteChairmanMessageIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Website chairman message created successfully',
    data: response,
  });
});

const getWebsiteChairmanMessage = catchAsync(async (req, res) => {
  const response =
    await WebsiteChairmanMessageService.getWebsiteChairmanMessageFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website chairman message retrieved successfully',
    data: response,
  });
});

const getWebsiteChairmanMessageById = catchAsync(async (req, res) => {
  const response =
    await WebsiteChairmanMessageService.getWebsiteChairmanMessageByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website chairman message retrieved successfully',
    data: response,
  });
});

const updateWebsiteChairmanMessage = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.chairman_image?.[0]
    ? getSingleImageUrl(req, files.chairman_image[0])
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
    await WebsiteChairmanMessageService.updateWebsiteChairmanMessageFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website chairman message updated successfully',
    data: response,
  });
});

const deleteWebsiteChairmanMessage = catchAsync(async (req, res) => {
  await WebsiteChairmanMessageService.deleteWebsiteChairmanMessageFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website chairman message deleted successfully',
  });
});

export const WebsiteChairmanMessageController = {
  createWebsiteChairmanMessage,
  getWebsiteChairmanMessage,
  getWebsiteChairmanMessageById,
  updateWebsiteChairmanMessage,
  deleteWebsiteChairmanMessage,
};
