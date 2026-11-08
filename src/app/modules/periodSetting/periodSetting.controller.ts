import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { periodSettingService } from './periodSetting.service';

const getPeriodSetting = catchAsync(async (req, res) => {
  const data = await periodSettingService.getPeriodSettingFromDB();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Period setting retrieved successfully',
    data,
  });
});

const createPeriodSetting = catchAsync(async (req, res) => {
  const data = await periodSettingService.createPeriodSettingIntoDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: 'Period setting created successfully',
    data,
  });
});

const updatePeriodSetting = catchAsync(async (req, res) => {
  const data = await periodSettingService.updatePeriodSettingInDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Period setting updated successfully',
    data,
  });
});

export const periodSettingController = {
  getPeriodSetting,
  createPeriodSetting,
  updatePeriodSetting,
};
