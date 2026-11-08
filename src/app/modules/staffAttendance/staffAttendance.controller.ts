import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StaffAttendanceService } from './staffAttendance.service';

const createStaffAttendance = catchAsync(async (req, res) => {
  const response = await StaffAttendanceService.createStaffAttendanceIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Staff attendance created successfully',
    data: response,
  });
});

const getAllStaffAttendances = catchAsync(async (req, res) => {
  const { meta, data } =
    await StaffAttendanceService.getAllStaffAttendancesFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff attendances retrieved successfully',
    meta,
    data,
  });
});

const getStaffAttendanceById = catchAsync(async (req, res) => {
  const response = await StaffAttendanceService.getStaffAttendanceByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff attendance retrieved successfully',
    data: response,
  });
});

const isTodayCheckInExists = catchAsync(async (req, res) => {
  const result = await StaffAttendanceService.isTodayCheckInExists(
    req.params.staff_id as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Check-in status retrieved successfully',
    data: result,
  });
});

const isTodayCheckOutExists = catchAsync(async (req, res) => {
  const result = await StaffAttendanceService.isTodayCheckOutExists(
    req.params.staff_id as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Check-out status retrieved successfully',
    data: result,
  });
});

const getTodayAttendanceStatusForStaff = catchAsync(async (req, res) => {
  const { staff_ids } = req.body;
  const result =
    await StaffAttendanceService.getTodayAttendanceStatusForStaff(staff_ids);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Attendance status retrieved successfully',
    data: result,
  });
});

const getStaffAttendanceReport = catchAsync(async (req, res) => {
  const { staff_id, staff_type, designation_id, start_date, end_date } =
    req.query;
  const result =
    await StaffAttendanceService.getStaffAttendanceReportFromDB({
      staff_id: staff_id as string | undefined,
      staff_type: staff_type as string | undefined,
      designation_id: designation_id as string | undefined,
      start_date: start_date as string | undefined,
      end_date: end_date as string | undefined,
    });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff attendance report retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const updateStaffAttendanceById = catchAsync(async (req, res) => {
  const response = await StaffAttendanceService.updateStaffAttendanceByIdIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff attendance updated successfully',
    data: response,
  });
});

const deleteStaffAttendanceById = catchAsync(async (req, res) => {
  const response = await StaffAttendanceService.deleteStaffAttendanceByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff attendance deleted successfully',
    data: response,
  });
});

const getStaffAttendanceHistory = catchAsync(async (req, res) => {
  const result = await StaffAttendanceService.getStaffAttendanceHistoryFromDB(
    req.params.staff_id as string,
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff attendance history retrieved successfully',
    data: result,
  });
});

export const StaffAttendanceController = {
  createStaffAttendance,
  getAllStaffAttendances,
  getStaffAttendanceById,
  isTodayCheckInExists,
  isTodayCheckOutExists,
  getTodayAttendanceStatusForStaff,
  updateStaffAttendanceById,
  deleteStaffAttendanceById,
  getStaffAttendanceReport,
  getStaffAttendanceHistory,
};