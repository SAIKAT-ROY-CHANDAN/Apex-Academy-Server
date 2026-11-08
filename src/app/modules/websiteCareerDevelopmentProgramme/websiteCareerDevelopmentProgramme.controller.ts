import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { WebsiteCareerDevelopmentProgrammeService } from './websiteCareerDevelopmentProgramme.service';

const createWebsiteCareerDevelopmentProgramme = catchAsync(async (req, res) => {
  const response =
    await WebsiteCareerDevelopmentProgrammeService.createWebsiteCareerDevelopmentProgrammeIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Career development programme created successfully',
    data: response,
  });
});

const getAllWebsiteCareerDevelopmentProgrammes = catchAsync(
  async (req, res) => {
    const response =
      await WebsiteCareerDevelopmentProgrammeService.getAllWebsiteCareerDevelopmentProgrammesFromDB(
        req.query,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Career development programmes retrieved successfully',
      meta: response.meta,
      data: response.data,
    });
  },
);

const getWebsiteCareerDevelopmentProgrammeById = catchAsync(
  async (req, res) => {
    const response =
      await WebsiteCareerDevelopmentProgrammeService.getWebsiteCareerDevelopmentProgrammeByIdFromDB(
        req.params.id as string,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Career development programme retrieved successfully',
      data: response,
    });
  },
);

const updateWebsiteCareerDevelopmentProgramme = catchAsync(
  async (req, res) => {
    const response =
      await WebsiteCareerDevelopmentProgrammeService.updateWebsiteCareerDevelopmentProgrammeFromDB(
        req.params.id as string,
        req.body,
      );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Career development programme updated successfully',
      data: response,
    });
  },
);

const deleteWebsiteCareerDevelopmentProgramme = catchAsync(
  async (req, res) => {
    await WebsiteCareerDevelopmentProgrammeService.deleteWebsiteCareerDevelopmentProgrammeFromDB(
      req.params.id as string,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Career development programme deleted successfully',
    });
  },
);

export const WebsiteCareerDevelopmentProgrammeController = {
  createWebsiteCareerDevelopmentProgramme,
  getAllWebsiteCareerDevelopmentProgrammes,
  getWebsiteCareerDevelopmentProgrammeById,
  updateWebsiteCareerDevelopmentProgramme,
  deleteWebsiteCareerDevelopmentProgramme,
};