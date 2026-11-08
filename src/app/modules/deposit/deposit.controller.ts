import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { depositService } from './deposit.service';

const createDeposit = catchAsync(async (req, res) => {
  const response = await depositService.createDepositIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Deposit created successfully',
    data: response,
  });
});

const getAllDeposits = catchAsync(async (req, res) => {
  const response = await depositService.getAllDepositsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Deposits retrieved successfully',
    data: response,
  });
});

const getDepositById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await depositService.getDepositByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Deposit retrieved successfully',
    data: response,
  });
});

const updateDeposit = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await depositService.updateDepositInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Deposit updated successfully',
    data: response,
  });
});

const deleteDeposit = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await depositService.deleteDepositFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Deposit deleted successfully',
    data: response,
  });
});

export const depositController = {
  createDeposit,
  getAllDeposits,
  getDepositById,
  updateDeposit,
  deleteDeposit,
};