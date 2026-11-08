import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { getSingleImageUrl, getSinglePdfUrl } from '../../utils/getUrl';
import { TeacherService } from './teacher.service';
import { teacherOverviewService } from './teacherOverview.service';

const createTeacher = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const photo = files?.photo?.[0]
    ? getSingleImageUrl(req, files.photo[0])
    : null;
  const nidFront = files?.nid_front?.[0]
    ? getSingleImageUrl(req, files.nid_front[0])
    : null;
  const nidBack = files?.nid_back?.[0]
    ? getSingleImageUrl(req, files.nid_back[0])
    : null;
  const academicDocument = files?.academic_document?.[0]
    ? getSinglePdfUrl(req, files.academic_document[0])
    : null;
  const previousInstitutionResignLetter = files
    ?.previous_institution_resign_letter?.[0]
    ? getSinglePdfUrl(req, files.previous_institution_resign_letter[0])
    : null;

  if (photo) req.body.photo = photo;
  if (nidFront) req.body.nid_front = nidFront;
  if (nidBack) req.body.nid_back = nidBack;
  if (academicDocument) req.body.academic_document = academicDocument;
  if (previousInstitutionResignLetter)
    req.body.previous_institution_resign_letter =
      previousInstitutionResignLetter;

  const response = await TeacherService.createTeacherIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Teacher created successfully',
    data: response,
  });
});

const loginTeacher = catchAsync(async (req, res) => {
  const response = await TeacherService.loginTeacherIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher logged in successfully',
    token: {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    },
    data: response.user,
  });
});

const getAllTeachers = catchAsync(async (req, res) => {
  const { meta, data } = await TeacherService.getAllTeachersFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teachers retrieved successfully',
    meta,
    data,
  });
});

const getTeacherById = catchAsync(async (req, res) => {
  const response = await TeacherService.getTeacherByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher retrieved successfully',
    data: response,
  });
});

const updateTeacherById = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const photo = files?.photo?.[0]
    ? getSingleImageUrl(req, files.photo[0])
    : null;
  const nidFront = files?.nid_front?.[0]
    ? getSingleImageUrl(req, files.nid_front[0])
    : null;
  const nidBack = files?.nid_back?.[0]
    ? getSingleImageUrl(req, files.nid_back[0])
    : null;
  const academicDocument = files?.academic_document?.[0]
    ? getSinglePdfUrl(req, files.academic_document[0])
    : null;
  const previousInstitutionResignLetter = files
    ?.previous_institution_resign_letter?.[0]
    ? getSinglePdfUrl(req, files.previous_institution_resign_letter[0])
    : null;

  if (photo) req.body.photo = photo;
  if (nidFront) req.body.nid_front = nidFront;
  if (nidBack) req.body.nid_back = nidBack;
  if (academicDocument) req.body.academic_document = academicDocument;
  if (previousInstitutionResignLetter)
    req.body.previous_institution_resign_letter =
      previousInstitutionResignLetter;

  const response = await TeacherService.updateTeacherByIdIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher updated successfully',
    data: response,
  });
});

const deleteTeacherById = catchAsync(async (req, res) => {
  const response = await TeacherService.deleteTeacherByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher deleted successfully',
    data: response,
  });
});

const getTeacherOverview = catchAsync(async (req, res) => {
  const teacherId = req.params.id as string;
  const response =
    await teacherOverviewService.getTeacherOverviewFromDB(teacherId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher overview retrieved successfully',
    data: response,
  });
});

export const TeacherController = {
  createTeacher,
  loginTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacherById,
  deleteTeacherById,
  getTeacherOverview,
};
