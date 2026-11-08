import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { WebsiteCareerDevelopmentApplicationService } from './websiteCareerDevelopmentApplication.service';

const createWebsiteCareerDevelopmentApplication = catchAsync(async (req, res) => {
  const response =
    await WebsiteCareerDevelopmentApplicationService.createWebsiteCareerDevelopmentApplicationIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Application submitted successfully',
    data: response,
  });
});

const getAllWebsiteCareerDevelopmentApplications = catchAsync(async (req, res) => {
  const response =
    await WebsiteCareerDevelopmentApplicationService.getAllWebsiteCareerDevelopmentApplicationsFromDB(
      req.query,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Applications retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getWebsiteCareerDevelopmentApplicationsByProgramme = catchAsync(
  async (req, res) => {
    const response =
      await WebsiteCareerDevelopmentApplicationService.getWebsiteCareerDevelopmentApplicationsByProgrammeFromDB(
        req.params.programmeId as string,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Applications retrieved successfully',
      data: response,
    });
  },
);

const getWebsiteCareerDevelopmentApplicationById = catchAsync(async (req, res) => {
  const response =
    await WebsiteCareerDevelopmentApplicationService.getWebsiteCareerDevelopmentApplicationByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Application retrieved successfully',
    data: response,
  });
});

const deleteWebsiteCareerDevelopmentApplication = catchAsync(async (req, res) => {
  await WebsiteCareerDevelopmentApplicationService.deleteWebsiteCareerDevelopmentApplicationFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Application deleted successfully',
  });
});

export const WebsiteCareerDevelopmentApplicationController = {
  createWebsiteCareerDevelopmentApplication,
  getAllWebsiteCareerDevelopmentApplications,
  getWebsiteCareerDevelopmentApplicationsByProgramme,
  getWebsiteCareerDevelopmentApplicationById,
  deleteWebsiteCareerDevelopmentApplication,
};