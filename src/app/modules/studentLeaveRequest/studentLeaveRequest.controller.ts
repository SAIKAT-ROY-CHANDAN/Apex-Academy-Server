import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StudentLeaveRequestService } from './studentLeaveRequest.service';

const createStudentLeaveRequest = catchAsync(async (req, res) => {
  // If authenticated as student, override student_id with token id for security
  const body = req.body;
  if (req.user?.userType === 'student' && req.user?.id) {
    body.student_id = req.user.id;
  }
  const response = await StudentLeaveRequestService.createStudentLeaveRequestIntoDB(body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Student leave request created successfully',
    data: response,
  });
});

const getAllStudentLeaveRequests = catchAsync(async (req, res) => {
  const { meta, data } = await StudentLeaveRequestService.getAllStudentLeaveRequestsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student leave requests retrieved successfully',
    meta,
    data,
  });
});

const getStudentLeaveRequestsByStudentId = catchAsync(async (req, res) => {
  // Allow student to fetch own without param, admin can fetch by param
  const studentId = (req.params.studentId as string) || (req.user?.id as string);
  const { meta, data } = await StudentLeaveRequestService.getStudentLeaveRequestsByStudentIdFromDB(
    studentId,
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student leave requests retrieved successfully',
    meta,
    data,
  });
});

const getMyLeaveRequests = catchAsync(async (req, res) => {
  const studentId = req.user?.id as string;
  const { meta, data } = await StudentLeaveRequestService.getStudentLeaveRequestsByStudentIdFromDB(
    studentId,
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'My leave requests retrieved successfully',
    meta,
    data,
  });
});

const getStudentLeaveRequestById = catchAsync(async (req, res) => {
  const response = await StudentLeaveRequestService.getStudentLeaveRequestByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student leave request retrieved successfully',
    data: response,
  });
});

const getStudentLeaveStats = catchAsync(async (req, res) => {
  const studentId = (req.query.student_id as string) || (req.user?.userType === 'student' ? (req.user.id as string) : undefined);
  const response = await StudentLeaveRequestService.getStudentLeaveStatsFromDB(studentId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student leave stats retrieved successfully',
    data: response,
  });
});

const updateStudentLeaveRequestById = catchAsync(async (req, res) => {
  const response = await StudentLeaveRequestService.updateStudentLeaveRequestByIdIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student leave request updated successfully',
    data: response,
  });
});

const deleteStudentLeaveRequestById = catchAsync(async (req, res) => {
  const response = await StudentLeaveRequestService.deleteStudentLeaveRequestByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student leave request deleted successfully',
    data: response,
  });
});

export const StudentLeaveRequestController = {
  createStudentLeaveRequest,
  getAllStudentLeaveRequests,
  getStudentLeaveRequestsByStudentId,
  getMyLeaveRequests,
  getStudentLeaveRequestById,
  getStudentLeaveStats,
  updateStudentLeaveRequestById,
  deleteStudentLeaveRequestById,
};
