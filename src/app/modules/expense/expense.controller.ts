import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { expenseService } from './expense.service';

const createExpense = catchAsync(async (req, res) => {
  const response = await expenseService.createExpenseIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Expense created successfully',
    data: response,
  });
});

const getAllExpenses = catchAsync(async (req, res) => {
  const response = await expenseService.getAllExpensesFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Expenses retrieved successfully',
    data: response,
  });
});

const getExpenseById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await expenseService.getExpenseByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Expense retrieved successfully',
    data: response,
  });
});

const updateExpense = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await expenseService.updateExpenseInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Expense updated successfully',
    data: response,
  });
});

const deleteExpense = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await expenseService.deleteExpenseFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Expense deleted successfully',
    data: response,
  });
});

export const expenseController = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};