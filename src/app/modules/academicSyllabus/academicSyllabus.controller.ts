import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSinglePdfUrl } from '../../utils/getUrl';
import { AcademicSyllabusService } from './academicSyllabus.service';

const createAcademicSyllabus = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const syllabusUrl = files?.syllabus_file?.[0]
    ? getSinglePdfUrl(req, files.syllabus_file[0])
    : null;

  if (syllabusUrl) req.body.syllabusUrl = syllabusUrl;

  if (req.body.removeSyllabus) delete req.body.removeSyllabus;

  const response =
    await AcademicSyllabusService.createAcademicSyllabusIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Academic syllabus created successfully',
    data: response,
  });
});

const getAllAcademicSyllabuses = catchAsync(async (req, res) => {
  const response =
    await AcademicSyllabusService.getAllAcademicSyllabusesFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic syllabuses retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getAcademicSyllabusById = catchAsync(async (req, res) => {
  const response =
    await AcademicSyllabusService.getAcademicSyllabusByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic syllabus retrieved successfully',
    data: response,
  });
});

const updateAcademicSyllabus = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const syllabusUrl = files?.syllabus_file?.[0]
    ? getSinglePdfUrl(req, files.syllabus_file[0])
    : null;

  if (syllabusUrl) {
    req.body.syllabusUrl = syllabusUrl;
  } else if (req.body.removeSyllabus === 'true') {
    req.body.syllabusUrl = null;
  }

  delete req.body.removeSyllabus;

  const response = await AcademicSyllabusService.updateAcademicSyllabusFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic syllabus updated successfully',
    data: response,
  });
});

const deleteAcademicSyllabus = catchAsync(async (req, res) => {
  await AcademicSyllabusService.deleteAcademicSyllabusFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic syllabus deleted successfully',
  });
});

export const AcademicSyllabusController = {
  createAcademicSyllabus,
  getAllAcademicSyllabuses,
  getAcademicSyllabusById,
  updateAcademicSyllabus,
  deleteAcademicSyllabus,
};
