import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { getSingleImageUrl } from '../../utils/getUrl';
import { AcademicFacilitiesService } from './academicFacilities.service';
import { AcademicTuitionType } from '../../../../generated/prisma/enums';

const createAcademicFacilities = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const mainUrl = files?.main_image?.[0]
    ? getSingleImageUrl(req, files.main_image[0])
    : null;
  const subOneUrl = files?.sub_one_image?.[0]
    ? getSingleImageUrl(req, files.sub_one_image[0])
    : null;
  const subTwoUrl = files?.sub_two_image?.[0]
    ? getSingleImageUrl(req, files.sub_two_image[0])
    : null;

  if (mainUrl) req.body.main_image_url = mainUrl;
  if (subOneUrl) req.body.sub_one_image_url = subOneUrl;
  if (subTwoUrl) req.body.sub_two_image_url = subTwoUrl;

  delete req.body.removeMainImage;
  delete req.body.removeSubOneImage;
  delete req.body.removeSubTwoImage;

  const response =
    await AcademicFacilitiesService.createAcademicFacilitiesIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Academic facilities created successfully',
    data: response,
  });
});

const getAllAcademicFacilities = catchAsync(async (req, res) => {
  const response =
    await AcademicFacilitiesService.getAllAcademicFacilitiesFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic facilities retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getAcademicFacilitiesById = catchAsync(async (req, res) => {
  const response =
    await AcademicFacilitiesService.getAcademicFacilitiesByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic facilities retrieved successfully',
    data: response,
  });
});

const getAcademicFacilitiesByType = catchAsync(async (req, res) => {
  const rawType = (req.params.type as string)?.toUpperCase();
  const allowed = Object.values(AcademicTuitionType) as string[];
  if (!rawType || !allowed.includes(rawType)) {
    throw new AppError(
      400,
      `Invalid facilities type. Allowed: ${allowed.join(', ')}`,
    );
  }
  const type = rawType as AcademicTuitionType;

  // ?all=true returns paginated list, otherwise returns single latest facility
  const asList = req.query.all === 'true';

  if (asList) {
    const response =
      await AcademicFacilitiesService.getAllAcademicFacilitiesByTypeFromDB(
        type,
        req.query,
      );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Academic facilities by type retrieved successfully',
      meta: response.meta,
      data: response.data,
    });
    return;
  }

  const response =
    await AcademicFacilitiesService.getAcademicFacilitiesByTypeFromDB(type);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic facility by type retrieved successfully',
    data: response,
  });
});

const updateAcademicFacilities = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const mainUrl = files?.main_image?.[0]
    ? getSingleImageUrl(req, files.main_image[0])
    : null;
  const subOneUrl = files?.sub_one_image?.[0]
    ? getSingleImageUrl(req, files.sub_one_image[0])
    : null;
  const subTwoUrl = files?.sub_two_image?.[0]
    ? getSingleImageUrl(req, files.sub_two_image[0])
    : null;

  if (mainUrl) {
    req.body.main_image_url = mainUrl;
  } else if (req.body.removeMainImage === 'true') {
    req.body.main_image_url = null;
  }

  if (subOneUrl) {
    req.body.sub_one_image_url = subOneUrl;
  } else if (req.body.removeSubOneImage === 'true') {
    req.body.sub_one_image_url = null;
  }

  if (subTwoUrl) {
    req.body.sub_two_image_url = subTwoUrl;
  } else if (req.body.removeSubTwoImage === 'true') {
    req.body.sub_two_image_url = null;
  }

  delete req.body.removeMainImage;
  delete req.body.removeSubOneImage;
  delete req.body.removeSubTwoImage;

  const response =
    await AcademicFacilitiesService.updateAcademicFacilitiesFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic facilities updated successfully',
    data: response,
  });
});

const deleteAcademicFacilities = catchAsync(async (req, res) => {
  await AcademicFacilitiesService.deleteAcademicFacilitiesFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic facilities deleted successfully',
  });
});

export const AcademicFacilitiesController = {
  createAcademicFacilities,
  getAllAcademicFacilities,
  getAcademicFacilitiesById,
  getAcademicFacilitiesByType,
  updateAcademicFacilities,
  deleteAcademicFacilities,
};
