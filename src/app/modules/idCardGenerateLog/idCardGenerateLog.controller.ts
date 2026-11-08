import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { IDCardGenerateLogService } from './idCardGenerateLog.service';

const createIDCardGenerateLog = catchAsync(async (req, res) => {
  const response = await IDCardGenerateLogService.createIDCardGenerateLogIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'ID card generate log created successfully',
    data: response,
  });
});

const getAllIDCardGenerateLogs = catchAsync(async (req, res) => {
  const response =
    await IDCardGenerateLogService.getAllIDCardGenerateLogsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ID card generate logs retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getIDCardGenerateLogById = catchAsync(async (req, res) => {
  const response =
    await IDCardGenerateLogService.getIDCardGenerateLogByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ID card generate log retrieved successfully',
    data: response,
  });
});

const updateIDCardGenerateLog = catchAsync(async (req, res) => {
  const response = await IDCardGenerateLogService.updateIDCardGenerateLogFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ID card generate log updated successfully',
    data: response,
  });
});

const deleteIDCardGenerateLog = catchAsync(async (req, res) => {
  await IDCardGenerateLogService.deleteIDCardGenerateLogFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ID card generate log deleted successfully',
  });
});

export const IDCardGenerateLogController = {
  createIDCardGenerateLog,
  getAllIDCardGenerateLogs,
  getIDCardGenerateLogById,
  updateIDCardGenerateLog,
  deleteIDCardGenerateLog,
};