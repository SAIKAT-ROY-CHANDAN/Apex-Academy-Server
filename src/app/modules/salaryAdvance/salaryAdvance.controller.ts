import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SalaryAdvanceService } from './salaryAdvance.service';

const createSalaryAdvance = catchAsync(async (req, res) => {
  const response = await SalaryAdvanceService.createSalaryAdvanceIntoDB(
    req.body,
    req.user?.id,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Salary advance created successfully',
    data: response,
  });
});

const getAllSalaryAdvances = catchAsync(async (req, res) => {
  const { meta, data } = await SalaryAdvanceService.getAllSalaryAdvancesFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Salary advances retrieved successfully',
    meta,
    data,
  });
});

const getSalaryAdvanceById = catchAsync(async (req, res) => {
  const response = await SalaryAdvanceService.getSalaryAdvanceByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Salary advance retrieved successfully',
    data: response,
  });
});

const updateSalaryAdvanceById = catchAsync(async (req, res) => {
  const response = await SalaryAdvanceService.updateSalaryAdvanceByIdIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Salary advance updated successfully',
    data: response,
  });
});

const deleteSalaryAdvanceById = catchAsync(async (req, res) => {
  const response = await SalaryAdvanceService.deleteSalaryAdvanceByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Salary advance deleted successfully',
    data: response,
  });
});

export const SalaryAdvanceController = {
  createSalaryAdvance,
  getAllSalaryAdvances,
  getSalaryAdvanceById,
  updateSalaryAdvanceById,
  deleteSalaryAdvanceById,
};