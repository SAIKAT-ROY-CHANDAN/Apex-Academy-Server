import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSinglePdfUrl } from '../../utils/getUrl';
import { WebsiteCurriculumService } from './websiteCurriculum.service';

const createWebsiteCurriculum = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const fileUrl = files?.curriculum_file?.[0]
    ? getSinglePdfUrl(req, files.curriculum_file[0])
    : null;

  if (fileUrl) req.body.fileUrl = fileUrl;

  const response = await WebsiteCurriculumService.createWebsiteCurriculumIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Curriculum created successfully',
    data: response,
  });
});

const getAllWebsiteCurriculums = catchAsync(async (req, res) => {
  const response =
    await WebsiteCurriculumService.getAllWebsiteCurriculumsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Curricula retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getWebsiteCurriculumById = catchAsync(async (req, res) => {
  const response =
    await WebsiteCurriculumService.getWebsiteCurriculumByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Curriculum retrieved successfully',
    data: response,
  });
});

const updateWebsiteCurriculum = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const fileUrl = files?.curriculum_file?.[0]
    ? getSinglePdfUrl(req, files.curriculum_file[0])
    : null;

  if (fileUrl) {
    req.body.fileUrl = fileUrl;
  } else if (req.body.removeFile === 'true') {
    req.body.fileUrl = null;
  }

  // This flag was only used to decide the above — strip it so it doesn't
  // get passed into Zod validation / Prisma as an unknown field.
  delete req.body.removeFile;

  const response = await WebsiteCurriculumService.updateWebsiteCurriculumFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Curriculum updated successfully',
    data: response,
  });
});

const deleteWebsiteCurriculum = catchAsync(async (req, res) => {
  await WebsiteCurriculumService.deleteWebsiteCurriculumFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Curriculum deleted successfully',
  });
});

export const WebsiteCurriculumController = {
  createWebsiteCurriculum,
  getAllWebsiteCurriculums,
  getWebsiteCurriculumById,
  updateWebsiteCurriculum,
  deleteWebsiteCurriculum,
};
