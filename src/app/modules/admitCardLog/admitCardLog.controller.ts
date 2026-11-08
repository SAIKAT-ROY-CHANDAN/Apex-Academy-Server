import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { admitCardLogService } from './admitCardLog.service';

const createAdmitCardLog = catchAsync(async (req, res) => {
  const response = await admitCardLogService.createAdmitCardLogIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Admit card log created successfully',
    data: response,
  });
});

const getAllAdmitCardLogs = catchAsync(async (req, res) => {
  const response = await admitCardLogService.getAllAdmitCardLogsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admit card logs retrieved successfully',
    data: response,
  });
});

const getAdmitCardLogById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await admitCardLogService.getAdmitCardLogByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admit card log retrieved successfully',
    data: response,
  });
});

const updateAdmitCardLog = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await admitCardLogService.updateAdmitCardLogInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admit card log updated successfully',
    data: response,
  });
});

const deleteAdmitCardLog = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await admitCardLogService.deleteAdmitCardLogFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Admit card log deleted successfully',
    data: response,
  });
});

export const admitCardLogController = {
  createAdmitCardLog,
  getAllAdmitCardLogs,
  getAdmitCardLogById,
  updateAdmitCardLog,
  deleteAdmitCardLog,
};