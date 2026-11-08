import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { depositTypeService } from './depositType.service';

const createDepositType = catchAsync(async (req, res) => {
  const response = await depositTypeService.createDepositTypeIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Deposit type created successfully',
    data: response,
  });
});

const getAllDepositTypes = catchAsync(async (req, res) => {
  const response = await depositTypeService.getAllDepositTypesFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Deposit types retrieved successfully',
    data: response,
  });
});

const getDepositTypeById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await depositTypeService.getDepositTypeByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Deposit type retrieved successfully',
    data: response,
  });
});

const updateDepositType = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await depositTypeService.updateDepositTypeInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Deposit type updated successfully',
    data: response,
  });
});

const deleteDepositType = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await depositTypeService.deleteDepositTypeFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Deposit type deleted successfully',
    data: response,
  });
});

export const depositTypeController = {
  createDepositType,
  getAllDepositTypes,
  getDepositTypeById,
  updateDepositType,
  deleteDepositType,
};