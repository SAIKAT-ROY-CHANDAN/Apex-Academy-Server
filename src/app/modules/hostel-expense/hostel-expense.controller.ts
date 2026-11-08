import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HostelExpenseService } from './hostel-expense.service';

const createHostelExpense = catchAsync(async (req, res) => {
  const response = await HostelExpenseService.createHostelExpenseIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Hostel expense created successfully',
    data: response,
  });
});

const getAllHostelExpenses = catchAsync(async (req, res) => {
  const response = await HostelExpenseService.getAllHostelExpensesFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel expenses retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getHostelExpenseById = catchAsync(async (req, res) => {
  const response = await HostelExpenseService.getHostelExpenseByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel expense retrieved successfully',
    data: response,
  });
});

const updateHostelExpense = catchAsync(async (req, res) => {
  const response = await HostelExpenseService.updateHostelExpenseFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel expense updated successfully',
    data: response,
  });
});

const deleteHostelExpense = catchAsync(async (req, res) => {
  await HostelExpenseService.deleteHostelExpenseFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel expense deleted successfully',
  });
});

const getHostelStudentsDueReport = catchAsync(async (req, res) => {
  const response = await HostelExpenseService.getHostelStudentsDueReportFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel students due report retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

export const HostelExpenseController = {
  createHostelExpense,
  getAllHostelExpenses,
  getHostelExpenseById,
  updateHostelExpense,
  deleteHostelExpense,
  getHostelStudentsDueReport,
};
