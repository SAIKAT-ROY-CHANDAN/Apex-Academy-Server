import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl } from '../../utils/getUrl';
import { AcademicProgramMediaService } from './academicProgramMedia.service';
import { normalizeSection } from './academicProgramMedia.type';

const createAcademicProgramMedia = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const photo =
    files?.academic_program_image?.[0]
      ? getSingleImageUrl(req, files.academic_program_image[0])
      : files?.academic_image?.[0]
        ? getSingleImageUrl(req, files.academic_image[0])
        : files?.photo?.[0]
          ? getSingleImageUrl(req, files.photo[0])
          : files?.file?.[0]
            ? getSingleImageUrl(req, files.file[0])
            : null;

  if (photo) req.body.fileUrl = photo;

  // Normalize section — accepts kebab-case (co-curriculum-activities) or SCREAMING_SNAKE
  if (req.body.section) {
    req.body.section = normalizeSection(String(req.body.section));
  } else if ((req as any).query?.section) {
    req.body.section = normalizeSection(String((req as any).query.section));
  } else if ((req as any).defaultSection) {
    req.body.section = normalizeSection(String((req as any).defaultSection));
  }

  // Normalize type to uppercase for service/validation
  if (req.body.type) req.body.type = String(req.body.type).toUpperCase();

  const response =
    await AcademicProgramMediaService.createAcademicProgramMediaIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Media created successfully',
    data: response,
  });
});

const getAllAcademicProgramMedia = catchAsync(async (req, res) => {
  const response =
    await AcademicProgramMediaService.getAllAcademicProgramMediaFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Media retrieved successfully',
    data: response,
  });
});

const deleteAcademicProgramMedia = catchAsync(async (req, res) => {
  await AcademicProgramMediaService.deleteAcademicProgramMediaFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Media deleted successfully',
  });
});

const deleteAllAcademicProgramMedia = catchAsync(async (req, res) => {
  const type = (req.query.type as string) || undefined;
  const section =
    (req.query.section as string) ||
    (req as any).defaultSection ||
    undefined;
  const result =
    await AcademicProgramMediaService.deleteAllAcademicProgramMediaFromDB(
      type,
      section,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: type
      ? `${type.toUpperCase()} media deleted successfully`
      : 'All media deleted successfully',
    data: result,
  });
});

export const AcademicProgramMediaController = {
  createAcademicProgramMedia,
  getAllAcademicProgramMedia,
  deleteAcademicProgramMedia,
  deleteAllAcademicProgramMedia,
};
