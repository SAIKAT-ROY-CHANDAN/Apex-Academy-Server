import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OvertimeStaffConfigService } from './overtimeStaffConfig.service';

const createOvertimeStaffConfig = catchAsync(async (req, res) => {
  const response =
    await OvertimeStaffConfigService.createOvertimeStaffConfigIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Overtime staff config created successfully',
    data: response,
  });
});

const getAllOvertimeStaffConfigs = catchAsync(async (req, res) => {
  const { meta, data } =
    await OvertimeStaffConfigService.getAllOvertimeStaffConfigsFromDB(
      req.query,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Overtime staff configs retrieved successfully',
    meta,
    data,
  });
});

const getOvertimeStaffConfigById = catchAsync(async (req, res) => {
  const response =
    await OvertimeStaffConfigService.getOvertimeStaffConfigByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Overtime staff config retrieved successfully',
    data: response,
  });
});

const updateOvertimeStaffConfigById = catchAsync(async (req, res) => {
  const response =
    await OvertimeStaffConfigService.updateOvertimeStaffConfigByIdIntoDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Overtime staff config updated successfully',
    data: response,
  });
});

const deleteOvertimeStaffConfigById = catchAsync(async (req, res) => {
  const response =
    await OvertimeStaffConfigService.deleteOvertimeStaffConfigByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Overtime staff config deleted successfully',
    data: response,
  });
});

export const OvertimeStaffConfigController = {
  createOvertimeStaffConfig,
  getAllOvertimeStaffConfigs,
  getOvertimeStaffConfigById,
  updateOvertimeStaffConfigById,
  deleteOvertimeStaffConfigById,
};
