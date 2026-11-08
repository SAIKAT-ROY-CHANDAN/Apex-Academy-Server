import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsiteHeroSectionService } from './websiteHeroSection.service';

const createWebsiteHeroSection = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.hero_image?.[0]
    ? getSingleImageUrl(req, files.hero_image[0])
    : null;

  if (image) req.body.imageUrl = image;

  const response =
    await WebsiteHeroSectionService.createWebsiteHeroSectionIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Website hero section created successfully',
    data: response,
  });
});

const getWebsiteHeroSection = catchAsync(async (req, res) => {
  const response =
    await WebsiteHeroSectionService.getWebsiteHeroSectionFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website hero section retrieved successfully',
    data: response,
  });
});

const getWebsiteHeroSectionById = catchAsync(async (req, res) => {
  const response =
    await WebsiteHeroSectionService.getWebsiteHeroSectionByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website hero section retrieved successfully',
    data: response,
  });
});

const updateWebsiteHeroSection = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.hero_image?.[0]
    ? getSingleImageUrl(req, files.hero_image[0])
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
    await WebsiteHeroSectionService.updateWebsiteHeroSectionFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website hero section updated successfully',
    data: response,
  });
});

const deleteWebsiteHeroSection = catchAsync(async (req, res) => {
  await WebsiteHeroSectionService.deleteWebsiteHeroSectionFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website hero section deleted successfully',
  });
});

export const WebsiteHeroSectionController = {
  createWebsiteHeroSection,
  getWebsiteHeroSection,
  getWebsiteHeroSectionById,
  updateWebsiteHeroSection,
  deleteWebsiteHeroSection,
};
