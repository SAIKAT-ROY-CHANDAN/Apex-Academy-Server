import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AcademicClassService } from './academicClass.service';

const createAcademicClass = catchAsync(async (req, res) => {
  const response = await AcademicClassService.createAcademicClassIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Academic class created successfully',
    data: response,
  });
});

const getAllAcademicClasses = catchAsync(async (req, res) => {
  const response = await AcademicClassService.getAllAcademicClassesFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic classes retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});
const getAcademicClassesByDepartmentId = catchAsync(async (req, res) => {
  const response = await AcademicClassService.getAcademicClassesByDepartmentIdFromDB(
    req.params.departmentId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic classes retrieved successfully',
    data: response,
  });
});

const getAcademicClassById = catchAsync(async (req, res) => {
  const response = await AcademicClassService.getAcademicClassByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic class retrieved successfully',
    data: response,
  });
});

const updateAcademicClass = catchAsync(async (req, res) => {
  const response = await AcademicClassService.updateAcademicClassFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic class updated successfully',
    data: response,
  });
});

const deleteAcademicClass = catchAsync(async (req, res) => {
  await AcademicClassService.deleteAcademicClassFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic class deleted successfully',
  });
});

export const AcademicClassController = {
  createAcademicClass,
  getAllAcademicClasses,
  getAcademicClassById,
  updateAcademicClass,
  deleteAcademicClass,
  getAcademicClassesByDepartmentId
};