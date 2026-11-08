import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StudentEnrollmentService } from './studentEnrollment.service';

const createStudentEnrollment = catchAsync(async (req, res) => {
  const response =
    await StudentEnrollmentService.createStudentEnrollmentIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Student enrollment created successfully',
    data: response,
  });
});

const getAllStudentEnrollments = catchAsync(async (req, res) => {
  const response =
    await StudentEnrollmentService.getAllStudentEnrollmentsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student enrollments retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getStudentEnrollmentById = catchAsync(async (req, res) => {
  const response =
    await StudentEnrollmentService.getStudentEnrollmentByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student enrollment retrieved successfully',
    data: response,
  });
});

const updateStudentEnrollment = catchAsync(async (req, res) => {
  const response =
    await StudentEnrollmentService.updateStudentEnrollmentFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student enrollment updated successfully',
    data: response,
  });
});

const deleteStudentEnrollment = catchAsync(async (req, res) => {
  await StudentEnrollmentService.deleteStudentEnrollmentFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student enrollment deleted successfully',
  });
});

const createSupplementaryAttempt = catchAsync(async (req, res) => {
  const response = await StudentEnrollmentService.createSupplementaryAttemptIntoDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Supplementary attempt created successfully',
    data: response,
  });
});

const getMyEnrollments = catchAsync(async (req: any, res) => {
  const userId = req.user?.id as string;
  if (!userId) {
    sendResponse(res, {
      statusCode: 401,
      success: false,
      message: 'Unauthorized: user id missing',
      data: null,
    });
    return;
  }

  const response = await StudentEnrollmentService.getMyEnrollmentsFromDB(
    userId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Enrollments retrieved successfully',
    data: response,
  });
});

export const StudentEnrollmentController = {
  createStudentEnrollment,
  createSupplementaryAttempt,
  getAllStudentEnrollments,
  getStudentEnrollmentById,
  updateStudentEnrollment,
  deleteStudentEnrollment,
  getMyEnrollments,
};