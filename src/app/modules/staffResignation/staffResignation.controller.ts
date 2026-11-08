import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StaffResignationService } from './staffResignation.service';

const createStaffResignation = catchAsync(async (req, res) => {
  const response = await StaffResignationService.createStaffResignationIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Staff resignation created successfully',
    data: response,
  });
});

const getAllStaffResignations = catchAsync(async (req, res) => {
  const { meta, data } =
    await StaffResignationService.getAllStaffResignationsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff resignations retrieved successfully',
    meta,
    data,
  });
});

const getStaffResignationById = catchAsync(async (req, res) => {
  const response = await StaffResignationService.getStaffResignationByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff resignation retrieved successfully',
    data: response,
  });
});

const updateStaffResignationById = catchAsync(async (req, res) => {
  const response =
    await StaffResignationService.updateStaffResignationByIdIntoDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff resignation updated successfully',
    data: response,
  });
});

const deleteStaffResignationById = catchAsync(async (req, res) => {
  const response =
    await StaffResignationService.deleteStaffResignationByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff resignation deleted successfully',
    data: response,
  });
});

export const StaffResignationController = {
  createStaffResignation,
  getAllStaffResignations,
  getStaffResignationById,
  updateStaffResignationById,
  deleteStaffResignationById,
};
