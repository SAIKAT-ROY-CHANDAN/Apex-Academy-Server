import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { studentExamResultService } from './studentExamResult.service';

const createStudentExamResult = catchAsync(async (req, res) => {
  const response = await studentExamResultService.createStudentExamResultIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Student exam result created successfully',
    data: response,
  });
});

const getAllStudentExamResults = catchAsync(async (req, res) => {
  const response = await studentExamResultService.getAllStudentExamResultsFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student exam results retrieved successfully',
    data: response,
  });
});

const getStudentExamResultById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await studentExamResultService.getStudentExamResultByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student exam result retrieved successfully',
    data: response,
  });
});

const updateStudentExamResult = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await studentExamResultService.updateStudentExamResultInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student exam result updated successfully',
    data: response,
  });
});

const deleteStudentExamResult = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await studentExamResultService.deleteStudentExamResultFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student exam result deleted successfully',
    data: response,
  });
});

export const studentExamResultController = {
  createStudentExamResult,
  getAllStudentExamResults,
  getStudentExamResultById,
  updateStudentExamResult,
  deleteStudentExamResult,
};