import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { BatchService } from './batch.service';

const createBatch = catchAsync(async (req, res) => {
  const response = await BatchService.createBatchIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Batch created successfully',
    data: response,
  });
});

const getAllBatches = catchAsync(async (req, res) => {
  const response = await BatchService.getAllBatchesFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Batches retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getBatchById = catchAsync(async (req, res) => {
  const response = await BatchService.getBatchByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Batch retrieved successfully',
    data: response,
  });
});

const updateBatch = catchAsync(async (req, res) => {
  const response = await BatchService.updateBatchFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Batch updated successfully',
    data: response,
  });
});

const deleteBatch = catchAsync(async (req, res) => {
  await BatchService.deleteBatchFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Batch deleted successfully',
  });
});

export const BatchController = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
};