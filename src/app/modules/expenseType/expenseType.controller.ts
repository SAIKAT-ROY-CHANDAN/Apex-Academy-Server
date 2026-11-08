import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { expenseTypeService } from './expenseType.service';

const createExpenseType = catchAsync(async (req, res) => {
  const response = await expenseTypeService.createExpenseTypeIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Expense type created successfully',
    data: response,
  });
});

const getAllExpenseTypes = catchAsync(async (req, res) => {
  const response = await expenseTypeService.getAllExpenseTypesFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Expense types retrieved successfully',
    data: response,
  });
});

const getExpenseTypeById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await expenseTypeService.getExpenseTypeByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Expense type retrieved successfully',
    data: response,
  });
});

const updateExpenseType = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await expenseTypeService.updateExpenseTypeInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Expense type updated successfully',
    data: response,
  });
});

const deleteExpenseType = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await expenseTypeService.deleteExpenseTypeFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Expense type deleted successfully',
    data: response,
  });
});

export const expenseTypeController = {
  createExpenseType,
  getAllExpenseTypes,
  getExpenseTypeById,
  updateExpenseType,
  deleteExpenseType,
};