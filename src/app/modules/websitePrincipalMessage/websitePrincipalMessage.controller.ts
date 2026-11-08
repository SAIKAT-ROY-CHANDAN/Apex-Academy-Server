import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsitePrincipalMessageService } from './websitePrincipalMessage.service';

const createWebsitePrincipalMessage = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.principal_image?.[0]
    ? getSingleImageUrl(req, files.principal_image[0])
    : null;

  if (image) req.body.imageUrl = image;

  const response =
    await WebsitePrincipalMessageService.createWebsitePrincipalMessageIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Website principal message created successfully',
    data: response,
  });
});

const getWebsitePrincipalMessage = catchAsync(async (req, res) => {
  const response =
    await WebsitePrincipalMessageService.getWebsitePrincipalMessageFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website principal message retrieved successfully',
    data: response,
  });
});

const getWebsitePrincipalMessageById = catchAsync(async (req, res) => {
  const response =
    await WebsitePrincipalMessageService.getWebsitePrincipalMessageByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website principal message retrieved successfully',
    data: response,
  });
});

const updateWebsitePrincipalMessage = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.principal_image?.[0]
    ? getSingleImageUrl(req, files.principal_image[0])
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
    await WebsitePrincipalMessageService.updateWebsitePrincipalMessageFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website principal message updated successfully',
    data: response,
  });
});

const deleteWebsitePrincipalMessage = catchAsync(async (req, res) => {
  await WebsitePrincipalMessageService.deleteWebsitePrincipalMessageFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website principal message deleted successfully',
  });
});

export const WebsitePrincipalMessageController = {
  createWebsitePrincipalMessage,
  getWebsitePrincipalMessage,
  getWebsitePrincipalMessageById,
  updateWebsitePrincipalMessage,
  deleteWebsitePrincipalMessage,
};
