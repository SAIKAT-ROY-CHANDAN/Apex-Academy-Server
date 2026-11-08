import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TeacherOvertimeService } from './teacherOvertime.service';

const createTeacherOvertime = catchAsync(async (req, res) => {
  const response = await TeacherOvertimeService.createTeacherOvertimeIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Teacher overtime started successfully',
    data: response,
  });
});

const startTeacherOvertime = catchAsync(async (req, res) => {
  const response = await TeacherOvertimeService.startTeacherOvertimeIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Teacher overtime started successfully',
    data: response,
  });
});

const endTeacherOvertime = catchAsync(async (req, res) => {
  const response = await TeacherOvertimeService.endTeacherOvertimeIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher overtime ended successfully',
    data: response,
  });
});

const getTodayOvertimeStatus = catchAsync(async (req, res) => {
  const { teacher_ids } = req.body;
  const response =
    await TeacherOvertimeService.getTodayOvertimeStatusForTeachers(teacher_ids);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Today overtime status retrieved successfully',
    data: response,
  });
});

const getAllTeacherOvertimes = catchAsync(async (req, res) => {
  const { meta, data } =
    await TeacherOvertimeService.getAllTeacherOvertimesFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher overtimes retrieved successfully',
    meta,
    data,
  });
});

const getTeacherOvertimeById = catchAsync(async (req, res) => {
  const response = await TeacherOvertimeService.getTeacherOvertimeByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher overtime retrieved successfully',
    data: response,
  });
});

const updateTeacherOvertimeById = catchAsync(async (req, res) => {
  const response =
    await TeacherOvertimeService.updateTeacherOvertimeByIdIntoDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher overtime updated successfully',
    data: response,
  });
});

const deleteTeacherOvertimeById = catchAsync(async (req, res) => {
  const response =
    await TeacherOvertimeService.deleteTeacherOvertimeByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher overtime deleted successfully',
    data: response,
  });
});

export const TeacherOvertimeController = {
  createTeacherOvertime,
  startTeacherOvertime,
  endTeacherOvertime,
  getTodayOvertimeStatus,
  getAllTeacherOvertimes,
  getTeacherOvertimeById,
  updateTeacherOvertimeById,
  deleteTeacherOvertimeById,
};
