import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { WebsiteVisionMissionService } from './websiteVisionMission.service';

const createWebsiteVisionMission = catchAsync(async (req, res) => {
  const response =
    await WebsiteVisionMissionService.createWebsiteVisionMissionIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Website vision & mission section created successfully',
    data: response,
  });
});

const getWebsiteVisionMission = catchAsync(async (req, res) => {
  const response =
    await WebsiteVisionMissionService.getWebsiteVisionMissionFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website vision & mission section retrieved successfully',
    data: response,
  });
});

const getWebsiteVisionMissionById = catchAsync(async (req, res) => {
  const response =
    await WebsiteVisionMissionService.getWebsiteVisionMissionByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website vision & mission section retrieved successfully',
    data: response,
  });
});

const updateWebsiteVisionMission = catchAsync(async (req, res) => {
  const response =
    await WebsiteVisionMissionService.updateWebsiteVisionMissionFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website vision & mission section updated successfully',
    data: response,
  });
});

const deleteWebsiteVisionMission = catchAsync(async (req, res) => {
  await WebsiteVisionMissionService.deleteWebsiteVisionMissionFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Website vision & mission section deleted successfully',
  });
});

export const WebsiteVisionMissionController = {
  createWebsiteVisionMission,
  getWebsiteVisionMission,
  getWebsiteVisionMissionById,
  updateWebsiteVisionMission,
  deleteWebsiteVisionMission,
};
