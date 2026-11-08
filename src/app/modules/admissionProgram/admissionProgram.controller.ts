import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { AdmissionProgramService } from './admissionProgram.service';
import { AdmissionProgramType } from '../../../../generated/prisma/enums';

const createAdmissionProgram = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.admission_image?.[0]
    ? getSingleImageUrl(req, files.admission_image[0])
    : null;

  if (image) req.body.imageUrl = image;

  const response = await AdmissionProgramService.createAdmissionProgramIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Admission program created successfully',
    data: response,
  });
});

const getAllAdmissionPrograms = catchAsync(async (req, res) => {
  const response = await AdmissionProgramService.getAllAdmissionProgramsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admission programs retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getActiveAdmissionProgramsByType = catchAsync(async (req, res) => {
  const { type } = req.query;
  const response =
    await AdmissionProgramService.getActiveAdmissionProgramsByType(
      type as AdmissionProgramType,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admission programs retrieved successfully',
    data: response,
  });
});

const getAdmissionProgramById = catchAsync(async (req, res) => {
  const response = await AdmissionProgramService.getAdmissionProgramByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admission program retrieved successfully',
    data: response,
  });
});

const updateAdmissionProgram = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const image = files?.admission_image?.[0]
    ? getSingleImageUrl(req, files.admission_image[0])
    : null;

  if (image) {
    req.body.imageUrl = image;
  } else if (req.body.removeImage === 'true') {
    req.body.imageUrl = null;
  }

  delete req.body.removeImage;

  const response = await AdmissionProgramService.updateAdmissionProgramFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admission program updated successfully',
    data: response,
  });
});

const deleteAdmissionProgram = catchAsync(async (req, res) => {
  await AdmissionProgramService.deleteAdmissionProgramFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admission program deleted successfully',
  });
});

export const AdmissionProgramController = {
  createAdmissionProgram,
  getAllAdmissionPrograms,
  getActiveAdmissionProgramsByType,
  getAdmissionProgramById,
  updateAdmissionProgram,
  deleteAdmissionProgram,
};
