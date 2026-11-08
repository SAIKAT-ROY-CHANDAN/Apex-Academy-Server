import catchAsync from '../../utils/catchAsync'; // adjust to your project's actual path
import sendResponse from '../../utils/sendResponse'; // adjust to your project's actual path
import { TeacherAttendanceService } from './teacherAttendance.service';

const createTeacherAttendance = catchAsync(async (req, res) => {
  const result = await TeacherAttendanceService.createTeacherAttendanceIntoDB(
    req.body,
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Teacher checked in successfully',
    data: result,
  });
});

const getAllTeacherAttendances = catchAsync(async (req, res) => {
  const result = await TeacherAttendanceService.getAllTeacherAttendancesFromDB(
    req.query,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher attendances retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getTeacherAttendanceById = catchAsync(async (req, res) => {
  const result = await TeacherAttendanceService.getTeacherAttendanceByIdFromDB(
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher attendance retrieved successfully',
    data: result,
  });
});

const isTodayCheckInExists = catchAsync(async (req, res) => {
  const result = await TeacherAttendanceService.isTodayCheckInExists(
    req.params.teacher_id as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Check-in status retrieved successfully',
    data: result,
  });
});

const isTodayCheckOutExists = catchAsync(async (req, res) => {
  const result = await TeacherAttendanceService.isTodayCheckOutExists(
    req.params.teacher_id as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Check-out status retrieved successfully',
    data: result,
  });
});

const getTodayAttendanceStatusForTeachers = catchAsync(async (req, res) => {
  const { teacher_ids } = req.body;
  const result =
    await TeacherAttendanceService.getTodayAttendanceStatusForTeachers(
      teacher_ids,
    );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Attendance status retrieved successfully',
    data: result,
  });
});

const updateTeacherAttendanceById = catchAsync(async (req, res) => {
  const result =
    await TeacherAttendanceService.updateTeacherAttendanceByIdIntoDB(
      req.params.id as string,
      req.body,
    );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher attendance updated successfully',
    data: result,
  });
});

const deleteTeacherAttendanceById = catchAsync(async (req, res) => {
  const result =
    await TeacherAttendanceService.deleteTeacherAttendanceByIdFromDB(
      req.params.id as string,
    );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher attendance deleted successfully',
    data: result,
  });
});

const getTeacherAttendanceHistory = catchAsync(async (req, res) => {
  const result = await TeacherAttendanceService.getTeacherAttendanceHistoryFromDB(
    req.params.teacher_id as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher attendance history retrieved successfully',
    data: result,
  });
});

const getTeacherAttendanceReport = catchAsync(async (req, res) => {
  const {
    teacher_id,
    teacher_type,
    designation_id,
    department_id,
    administrative_position,
    start_date,
    end_date,
  } = req.query;
  const result = await TeacherAttendanceService.getTeacherAttendanceReportFromDB({
    teacher_id: teacher_id as string | undefined,
    teacher_type: teacher_type as string | undefined,
    designation_id: designation_id as string | undefined,
    department_id: department_id as string | undefined,
    administrative_position: administrative_position as string | undefined,
    start_date: start_date as string | undefined,
    end_date: end_date as string | undefined,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher attendance report retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const TeacherAttendanceController = {
  createTeacherAttendance,
  getAllTeacherAttendances,
  getTeacherAttendanceById,
  isTodayCheckInExists,
  isTodayCheckOutExists,
  getTodayAttendanceStatusForTeachers,
  updateTeacherAttendanceById,
  deleteTeacherAttendanceById,
  getTeacherAttendanceReport,
  getTeacherAttendanceHistory,
};
