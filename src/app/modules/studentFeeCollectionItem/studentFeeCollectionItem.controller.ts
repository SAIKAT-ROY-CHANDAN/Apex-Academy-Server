import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StudentFeeCollectionItemService } from './studentFeeCollectionItem.service';

const createStudentFeeCollectionItem = catchAsync(async (req, res) => {
  const response =
    await StudentFeeCollectionItemService.createStudentFeeCollectionItemIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Student fee collection item created successfully',
    data: response,
  });
});

const getAllStudentFeeCollectionItems = catchAsync(async (req, res) => {
  const response =
    await StudentFeeCollectionItemService.getAllStudentFeeCollectionItemsFromDB(
      req.query,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee collection items retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getStudentFeeCollectionItemsByStudent = catchAsync(async (req, res) => {
  const response =
    await StudentFeeCollectionItemService.getStudentFeeCollectionItemsByStudentFromDB(
      req.params.studentId as string,
      req.query.academic_class_id as string | undefined,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee collection items retrieved successfully',
    data: response,
  });
});

const getStudentFeeCollectionItemById = catchAsync(async (req, res) => {
  const response =
    await StudentFeeCollectionItemService.getStudentFeeCollectionItemByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee collection item retrieved successfully',
    data: response,
  });
});

const updateStudentFeeCollectionItem = catchAsync(async (req, res) => {
  const response =
    await StudentFeeCollectionItemService.updateStudentFeeCollectionItemFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee collection item updated successfully',
    data: response,
  });
});

const editStudentFeeCollectionItem = catchAsync(async (req, res) => {
  const response =
    await StudentFeeCollectionItemService.editStudentFeeCollectionItemFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee collection item updated successfully',
    data: response,
  });
});

const deleteStudentFeeCollectionItem = catchAsync(async (req, res) => {
  await StudentFeeCollectionItemService.deleteStudentFeeCollectionItemFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student fee collection item deleted successfully',
  });
});

export const StudentFeeCollectionItemController = {
  createStudentFeeCollectionItem,
  getAllStudentFeeCollectionItems,
  getStudentFeeCollectionItemsByStudent,
  getStudentFeeCollectionItemById,
  updateStudentFeeCollectionItem,
  editStudentFeeCollectionItem,
  deleteStudentFeeCollectionItem,
};
