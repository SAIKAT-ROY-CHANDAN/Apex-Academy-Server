import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StudentFeeService } from './studentFee.service';
import { QueryParams } from '../../builders/prismaBuilderQuery';

const createStudentFee = catchAsync(async (req, res) => {
  const response = await StudentFeeService.createStudentFeeIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Student fee created successfully',
    data: response,
  });
});

const getAllStudentFees = catchAsync(async (req, res) => {
  const response = await StudentFeeService.getAllStudentFeesFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fees retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getStudentFeeById = catchAsync(async (req, res) => {
  const response = await StudentFeeService.getStudentFeeByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee retrieved successfully',
    data: response,
  });
});

const updateStudentFee = catchAsync(async (req, res) => {
  const response = await StudentFeeService.updateStudentFeeFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee updated successfully',
    data: response,
  });
});

const deleteStudentFee = catchAsync(async (req, res) => {
  await StudentFeeService.deleteStudentFeeFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee deleted successfully',
  });
});

const getStudentFeeDueWithDetails = catchAsync(async (req, res) => {
  const query: QueryParams = {
    searchTerm: req.query.searchTerm as string | undefined,
    filter: req.query.filter as Record<string, any> | undefined,
    orderBy: req.query.orderBy as Record<string, any> | undefined,
    page: req.query.page as string | undefined,
    limit: req.query.limit as string | undefined,
  };

  const response = await StudentFeeService.getStudentFeeDueWithDetailsFromDB(query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee due with student details retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

export const StudentFeeController = {
  createStudentFee,
  getAllStudentFees,
  getStudentFeeById,
  updateStudentFee,
  deleteStudentFee,
  getStudentFeeDueWithDetails,
};