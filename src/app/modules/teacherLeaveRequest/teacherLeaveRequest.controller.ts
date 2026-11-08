import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TeacherLeaveRequestService } from './teacherLeaveRequest.service';

const createTeacherLeaveRequest = catchAsync(async (req, res) => {
  const response =
    await TeacherLeaveRequestService.createTeacherLeaveRequestIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Teacher leave request created successfully',
    data: response,
  });
});

const getAllTeacherLeaveRequests = catchAsync(async (req, res) => {
  const { meta, data } =
    await TeacherLeaveRequestService.getAllTeacherLeaveRequestsFromDB(
      req.query,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher leave requests retrieved successfully',
    meta,
    data,
  });
});

const getTeacherLeaveRequestByTeacherId = catchAsync(async (req, res) => {
  const response =
    await TeacherLeaveRequestService.getTeacherLeaveRequestByTeacherIdFromDB(
      req.params.teacherId as string,
      req.query,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher leave requests retrieved successfully',
    data: response,
  });
});

const getTeacherLeaveRequestById = catchAsync(async (req, res) => {
  const response =
    await TeacherLeaveRequestService.getTeacherLeaveRequestByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher leave request retrieved successfully',
    data: response,
  });
});

const updateTeacherLeaveRequestById = catchAsync(async (req, res) => {
  const response =
    await TeacherLeaveRequestService.updateTeacherLeaveRequestByIdIntoDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher leave request updated successfully',
    data: response,
  });
});

const deleteTeacherLeaveRequestById = catchAsync(async (req, res) => {
  const response =
    await TeacherLeaveRequestService.deleteTeacherLeaveRequestByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher leave request deleted successfully',
    data: response,
  });
});

export const TeacherLeaveRequestController = {
  createTeacherLeaveRequest,
  getAllTeacherLeaveRequests,
  getTeacherLeaveRequestById,
  updateTeacherLeaveRequestById,
  deleteTeacherLeaveRequestById,
  getTeacherLeaveRequestByTeacherId,
};