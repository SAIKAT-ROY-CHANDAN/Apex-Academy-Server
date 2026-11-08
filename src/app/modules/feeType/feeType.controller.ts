import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FeeTypeService } from './feeType.service';

const createFeeType = catchAsync(async (req, res) => {
  const response = await FeeTypeService.createFeeTypeIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Fee type created successfully',
    data: response,
  });
});

const getAllFeeTypes = catchAsync(async (req, res) => {
  const response = await FeeTypeService.getAllFeeTypesFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fee types retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});
const feeManage = catchAsync(async (req, res) => {
  const response = await FeeTypeService.feeManageFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fee types retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getFeeTypeById = catchAsync(async (req, res) => {
  const response = await FeeTypeService.getFeeTypeByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fee type retrieved successfully',
    data: response,
  });
});

const updateFeeType = catchAsync(async (req, res) => {
  const response = await FeeTypeService.updateFeeTypeFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fee type updated successfully',
    data: response,
  });
});

const deleteFeeType = catchAsync(async (req, res) => {
  await FeeTypeService.deleteFeeTypeFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fee type deleted successfully',
  });
});

export const FeeTypeController = {
  createFeeType,
  getAllFeeTypes,
  getFeeTypeById,
  updateFeeType,
  deleteFeeType,
  feeManage,
};