import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StaffOvertimeService } from './staffOvertime.service';

const createStaffOvertime = catchAsync(async (req, res) => {
  const response = await StaffOvertimeService.createStaffOvertimeIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Staff overtime created successfully',
    data: response,
  });
});

const createStaffOvertimeByStaffId = catchAsync(async (req, res) => {
  const response = await StaffOvertimeService.createStaffOvertimeByStaffIdFromDB(
    req.params.staffId as string,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Staff overtime started successfully',
    data: response,
  });
});

const startStaffOvertime = catchAsync(async (req, res) => {
  const response = await StaffOvertimeService.startStaffOvertimeIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Staff overtime started successfully',
    data: response,
  });
});

const endStaffOvertime = catchAsync(async (req, res) => {
  const response = await StaffOvertimeService.endStaffOvertimeIntoDB(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff overtime ended successfully',
    data: response,
  });
});

const getTodayOvertimeStatus = catchAsync(async (req, res) => {
  const { staff_ids } = req.body;
  const response =
    await StaffOvertimeService.getTodayOvertimeStatusForStaff(staff_ids);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Today overtime status retrieved successfully',
    data: response,
  });
});

const getAllStaffOvertimes = catchAsync(async (req, res) => {
  const { meta, data } = await StaffOvertimeService.getAllStaffOvertimesFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff overtimes retrieved successfully',
    meta,
    data,
  });
});

const getStaffOvertimeById = catchAsync(async (req, res) => {
  const response = await StaffOvertimeService.getStaffOvertimeByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff overtime retrieved successfully',
    data: response,
  });
});

const updateStaffOvertimeById = catchAsync(async (req, res) => {
  const response = await StaffOvertimeService.updateStaffOvertimeByIdIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff overtime updated successfully',
    data: response,
  });
});

const deleteStaffOvertimeById = catchAsync(async (req, res) => {
  const response = await StaffOvertimeService.deleteStaffOvertimeByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff overtime deleted successfully',
    data: response,
  });
});

export const StaffOvertimeController = {
  createStaffOvertime,
  createStaffOvertimeByStaffId,
  startStaffOvertime,
  endStaffOvertime,
  getTodayOvertimeStatus,
  getAllStaffOvertimes,
  getStaffOvertimeById,
  updateStaffOvertimeById,
  deleteStaffOvertimeById,
};
