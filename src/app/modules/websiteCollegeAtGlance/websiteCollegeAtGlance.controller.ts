import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsiteCollegeAtGlanceService } from './websiteCollegeAtGlance.service';

const IMAGE_FIELDS = [
  'glance_image_1',
  'glance_image_2',
  'glance_image_3',
  'glance_image_4',
] as const;

const createWebsiteCollegeAtGlance = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  IMAGE_FIELDS.forEach((field, index) => {
    const file = files?.[field]?.[0];
    const key = `imageUrl${index + 1}`;
    if (file) {
      req.body[key] = getSingleImageUrl(req, file);
    }
  });

  const response =
    await WebsiteCollegeAtGlanceService.createWebsiteCollegeAtGlanceIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Website college at a glance section created successfully',
    data: response,
  });
});

const getWebsiteCollegeAtGlance = catchAsync(async (req, res) => {
  const response =
    await WebsiteCollegeAtGlanceService.getWebsiteCollegeAtGlanceFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website college at a glance section retrieved successfully',
    data: response,
  });
});

const getWebsiteCollegeAtGlanceById = catchAsync(async (req, res) => {
  const response =
    await WebsiteCollegeAtGlanceService.getWebsiteCollegeAtGlanceByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website college at a glance section retrieved successfully',
    data: response,
  });
});

const updateWebsiteCollegeAtGlance = catchAsync(async (req, res) => {
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
    await WebsiteCollegeAtGlanceService.updateWebsiteCollegeAtGlanceFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website college at a glance section updated successfully',
    data: response,
  });
});

const deleteWebsiteCollegeAtGlance = catchAsync(async (req, res) => {
  await WebsiteCollegeAtGlanceService.deleteWebsiteCollegeAtGlanceFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website college at a glance section deleted successfully',
  });
});

export const WebsiteCollegeAtGlanceController = {
  createWebsiteCollegeAtGlance,
  getWebsiteCollegeAtGlance,
  getWebsiteCollegeAtGlanceById,
  updateWebsiteCollegeAtGlance,
  deleteWebsiteCollegeAtGlance,
};
