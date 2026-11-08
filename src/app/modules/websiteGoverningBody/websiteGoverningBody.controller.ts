import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsiteGoverningBodyService } from './websiteGoverningBody.service';

const createWebsiteGoverningBodyMember = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.governing_image?.[0]
    ? getSingleImageUrl(req, files.governing_image[0])
    : null;

  if (image) req.body.imageUrl = image;

  const response =
    await WebsiteGoverningBodyService.createWebsiteGoverningBodyMemberIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Website governing body member created successfully',
    data: response,
  });
});

const getAllWebsiteGoverningBodyMembers = catchAsync(async (req, res) => {
  const response =
    await WebsiteGoverningBodyService.getAllWebsiteGoverningBodyMembersFromDB(
      req.query,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website governing body members retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getWebsiteGoverningBodyMemberById = catchAsync(async (req, res) => {
  const response =
    await WebsiteGoverningBodyService.getWebsiteGoverningBodyMemberByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website governing body member retrieved successfully',
    data: response,
  });
});

const updateWebsiteGoverningBodyMember = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.governing_image?.[0]
    ? getSingleImageUrl(req, files.governing_image[0])
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
    await WebsiteGoverningBodyService.updateWebsiteGoverningBodyMemberFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website governing body member updated successfully',
    data: response,
  });
});

const deleteWebsiteGoverningBodyMember = catchAsync(async (req, res) => {
  await WebsiteGoverningBodyService.deleteWebsiteGoverningBodyMemberFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website governing body member deleted successfully',
  });
});

export const WebsiteGoverningBodyController = {
  createWebsiteGoverningBodyMember,
  getAllWebsiteGoverningBodyMembers,
  getWebsiteGoverningBodyMemberById,
  updateWebsiteGoverningBodyMember,
  deleteWebsiteGoverningBodyMember,
};
