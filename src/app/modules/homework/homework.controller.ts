import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HomeworkService } from './homework.service';

const createHomework = catchAsync(async (req, res) => {
  const response = await HomeworkService.createHomeworkIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Homework created successfully',
    data: response,
  });
});

const getAllHomeworks = catchAsync(async (req, res) => {
  const { meta, data } = await HomeworkService.getAllHomeworksFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Homeworks retrieved successfully',
    meta,
    data,
  });
});

const getMyHomework = catchAsync(async (req, res) => {
  const studentId = req.user?.id as string;
  const { meta, data } = await HomeworkService.getHomeworksByStudentId(studentId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Homeworks retrieved successfully',
    meta,
    data,
  });
});

const getHomeworkById = catchAsync(async (req, res) => {
  const response = await HomeworkService.getHomeworkByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Homework retrieved successfully',
    data: response,
  });
});

const updateHomeworkById = catchAsync(async (req, res) => {
  const response = await HomeworkService.updateHomeworkByIdIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Homework updated successfully',
    data: response,
  });
});

const deleteHomeworkById = catchAsync(async (req, res) => {
  const response = await HomeworkService.deleteHomeworkByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Homework deleted successfully',
    data: response,
  });
});

export const HomeworkController = {
  createHomework,
  getAllHomeworks,
  getMyHomework,
  getHomeworkById,
  updateHomeworkById,
  deleteHomeworkById,
};