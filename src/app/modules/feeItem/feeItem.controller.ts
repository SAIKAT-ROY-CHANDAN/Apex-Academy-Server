import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { FeeItemService } from './feeItem.service';

const createFeeItem = catchAsync(async (req, res) => {
  const response = await FeeItemService.createFeeItemIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Fee item created successfully',
    data: response,
  });
});

const getAllFeeItems = catchAsync(async (req, res) => {
  const response = await FeeItemService.getAllFeeItemsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fee items retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getFeeItemById = catchAsync(async (req, res) => {
  const response = await FeeItemService.getFeeItemByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fee item retrieved successfully',
    data: response,
  });
});

const updateFeeItem = catchAsync(async (req, res) => {
  const response = await FeeItemService.updateFeeItemFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fee item updated successfully',
    data: response,
  });
});

const deleteFeeItem = catchAsync(async (req, res) => {
  await FeeItemService.deleteFeeItemFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fee item deleted successfully',
  });
});
const getFeeItemByFeeTypeId = catchAsync(async (req, res) => {
  const response = await FeeItemService.getFeeItemByFeeTypeIdFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Fee items retrieved successfully',
    data: response,
  });
});

export const FeeItemController = {
  createFeeItem,
  getAllFeeItems,
  getFeeItemById,
  updateFeeItem,
  deleteFeeItem,
  getFeeItemByFeeTypeId,
};