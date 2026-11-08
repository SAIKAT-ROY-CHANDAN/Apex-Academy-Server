import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OvertimeTeacherConfigService } from './overtimeTeacherConfig.service';

const createOvertimeTeacherConfig = catchAsync(async (req, res) => {
  const response =
    await OvertimeTeacherConfigService.createOvertimeTeacherConfigIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Overtime teacher config created successfully',
    data: response,
  });
});

const getAllOvertimeTeacherConfigs = catchAsync(async (req, res) => {
  const { meta, data } =
    await OvertimeTeacherConfigService.getAllOvertimeTeacherConfigsFromDB(
      req.query,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Overtime teacher configs retrieved successfully',
    meta,
    data,
  });
});

const getOvertimeTeacherConfigById = catchAsync(async (req, res) => {
  const response =
    await OvertimeTeacherConfigService.getOvertimeTeacherConfigByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Overtime teacher config retrieved successfully',
    data: response,
  });
});

const updateOvertimeTeacherConfigById = catchAsync(async (req, res) => {
  const response =
    await OvertimeTeacherConfigService.updateOvertimeTeacherConfigByIdIntoDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Overtime teacher config updated successfully',
    data: response,
  });
});

const deleteOvertimeTeacherConfigById = catchAsync(async (req, res) => {
  const response =
    await OvertimeTeacherConfigService.deleteOvertimeTeacherConfigByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Overtime teacher config deleted successfully',
    data: response,
  });
});

export const OvertimeTeacherConfigController = {
  createOvertimeTeacherConfig,
  getAllOvertimeTeacherConfigs,
  getOvertimeTeacherConfigById,
  updateOvertimeTeacherConfigById,
  deleteOvertimeTeacherConfigById,
};