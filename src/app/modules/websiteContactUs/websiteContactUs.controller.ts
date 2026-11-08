import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { WebsiteContactUsService } from './websiteContactUs.service';

const createWebsiteContactUs = catchAsync(async (req, res) => {
  const response =
    await WebsiteContactUsService.createWebsiteContactUsIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Contact Us created successfully',
    data: response,
  });
});

const getWebsiteContactUs = catchAsync(async (req, res) => {
  const response = await WebsiteContactUsService.getWebsiteContactUsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Contact Us retrieved successfully',
    data: response,
  });
});

const getWebsiteContactUsById = catchAsync(async (req, res) => {
  const response =
    await WebsiteContactUsService.getWebsiteContactUsByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Contact Us retrieved successfully',
    data: response,
  });
});

const updateWebsiteContactUs = catchAsync(async (req, res) => {
  const response =
    await WebsiteContactUsService.updateWebsiteContactUsFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Contact Us updated successfully',
    data: response,
  });
});

const deleteWebsiteContactUs = catchAsync(async (req, res) => {
  await WebsiteContactUsService.deleteWebsiteContactUsFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Contact Us deleted successfully',
  });
});

export const WebsiteContactUsController = {
  createWebsiteContactUs,
  getWebsiteContactUs,
  getWebsiteContactUsById,
  updateWebsiteContactUs,
  deleteWebsiteContactUs,
};
