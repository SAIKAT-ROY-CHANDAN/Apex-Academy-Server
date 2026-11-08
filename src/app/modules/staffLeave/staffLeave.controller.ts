import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StaffLeaveService } from './staffLeave.service';

const createStaffLeave = catchAsync(async (req, res) => {
  const response = await StaffLeaveService.createStaffLeaveIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Staff leave created successfully',
    data: response,
  });
});

const getAllStaffLeaves = catchAsync(async (req, res) => {
  const { meta, data } = await StaffLeaveService.getAllStaffLeavesFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff leaves retrieved successfully',
    meta,
    data,
  });
});

const getStaffLeaveById = catchAsync(async (req, res) => {
  const response = await StaffLeaveService.getStaffLeaveByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff leave retrieved successfully',
    data: response,
  });
});

const updateStaffLeaveById = catchAsync(async (req, res) => {
  const response = await StaffLeaveService.updateStaffLeaveByIdIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff leave updated successfully',
    data: response,
  });
});

const deleteStaffLeaveById = catchAsync(async (req, res) => {
  const response = await StaffLeaveService.deleteStaffLeaveByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff leave deleted successfully',
    data: response,
  });
});

export const StaffLeaveController = {
  createStaffLeave,
  getAllStaffLeaves,
  getStaffLeaveById,
  updateStaffLeaveById,
  deleteStaffLeaveById,
};
