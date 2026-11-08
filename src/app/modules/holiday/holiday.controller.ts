import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HolidayService } from './holiday.service';

const createHoliday = catchAsync(async (req, res) => {
  const response = await HolidayService.createHolidayIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Holiday created successfully',
    data: response,
  });
});

const getAllHolidays = catchAsync(async (req, res) => {
  const response = await HolidayService.getAllHolidaysFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Holidays retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getCalendarHolidays = catchAsync(async (req, res) => {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const response = await HolidayService.getCalendarHolidaysFromDB(year);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Calendar holidays retrieved successfully',
    data: response,
  });
});

const getHolidayById = catchAsync(async (req, res) => {
  const response = await HolidayService.getHolidayByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Holiday retrieved successfully',
    data: response,
  });
});

const updateHoliday = catchAsync(async (req, res) => {
  const response = await HolidayService.updateHolidayFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Holiday updated successfully',
    data: response,
  });
});

const deleteHoliday = catchAsync(async (req, res) => {
  await HolidayService.deleteHolidayFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Holiday deleted successfully',
  });
});

export const HolidayController = {
  createHoliday,
  getAllHolidays,
  getCalendarHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
};