import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StudentFeeCollectionService } from './studentFeeCollection.service';

const createStudentFeeCollection = catchAsync(async (req, res) => {
  const response =
    await StudentFeeCollectionService.createStudentFeeCollectionIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Student fee collection created successfully',
    data: response,
  });
});

const getAllStudentFeeCollections = catchAsync(async (req, res) => {
  const response =
    await StudentFeeCollectionService.getAllStudentFeeCollectionsFromDB(
      req.query,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee collections retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getStudentFeeCollectionById = catchAsync(async (req, res) => {
  const response =
    await StudentFeeCollectionService.getStudentFeeCollectionByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee collection retrieved successfully',
    data: response,
  });
});

const updateStudentFeeCollection = catchAsync(async (req, res) => {
  const response =
    await StudentFeeCollectionService.updateStudentFeeCollectionFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee collection updated successfully',
    data: response,
  });
});

const deleteStudentFeeCollection = catchAsync(async (req, res) => {
  await StudentFeeCollectionService.deleteStudentFeeCollectionFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee collection deleted successfully',
  });
});

export const StudentFeeCollectionController = {
  createStudentFeeCollection,
  getAllStudentFeeCollections,
  getStudentFeeCollectionById,
  updateStudentFeeCollection,
  deleteStudentFeeCollection,
};