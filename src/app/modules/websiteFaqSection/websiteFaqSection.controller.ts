import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { WebsiteFaqSectionService } from './websiteFaqSection.service';

const createWebsiteFaqSection = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.faq_image?.[0]
    ? getSingleImageUrl(req, files.faq_image[0])
    : null;

  if (image) req.body.imageUrl = image;

  const response =
    await WebsiteFaqSectionService.createWebsiteFaqSectionIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'FAQ section created successfully',
    data: response,
  });
});

const getWebsiteFaqSection = catchAsync(async (req, res) => {
  const response =
    await WebsiteFaqSectionService.getWebsiteFaqSectionFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'FAQ section retrieved successfully',
    data: response,
  });
});

const getWebsiteFaqSectionById = catchAsync(async (req, res) => {
  const response =
    await WebsiteFaqSectionService.getWebsiteFaqSectionByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'FAQ section retrieved successfully',
    data: response,
  });
});

const updateWebsiteFaqSection = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.faq_image?.[0]
    ? getSingleImageUrl(req, files.faq_image[0])
    : null;

  if (image) {
    req.body.imageUrl = image;
  } else if (req.body.removeImage === 'true') {
    req.body.imageUrl = null;
  }

  delete req.body.removeImage;

  const response =
    await WebsiteFaqSectionService.updateWebsiteFaqSectionFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'FAQ section updated successfully',
    data: response,
  });
});

const deleteWebsiteFaqSection = catchAsync(async (req, res) => {
  await WebsiteFaqSectionService.deleteWebsiteFaqSectionFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'FAQ section deleted successfully',
  });
});

export const WebsiteFaqSectionController = {
  createWebsiteFaqSection,
  getWebsiteFaqSection,
  getWebsiteFaqSectionById,
  updateWebsiteFaqSection,
  deleteWebsiteFaqSection,
};
