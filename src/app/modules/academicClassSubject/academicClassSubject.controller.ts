import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AcademicClassSubjectService } from './academicClassSubject.service';

const createAcademicClassSubject = catchAsync(async (req, res) => {
  const response =
    await AcademicClassSubjectService.createAcademicClassSubjectIntoDB(
      req.body,
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Academic class subject created successfully',
    data: response,
  });
});

const getAllAcademicClassSubjects = catchAsync(async (req, res) => {
  const response =
    await AcademicClassSubjectService.getAllAcademicClassSubjectsFromDB(
      req.query,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic class subjects retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getAcademicClassSubjectById = catchAsync(async (req, res) => {
  const response =
    await AcademicClassSubjectService.getAcademicClassSubjectByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic class subject retrieved successfully',
    data: response,
  });
});

const updateAcademicClassSubject = catchAsync(async (req, res) => {
  const response =
    await AcademicClassSubjectService.updateAcademicClassSubjectFromDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic class subject updated successfully',
    data: response,
  });
});

const deleteAcademicClassSubject = catchAsync(async (req, res) => {
  await AcademicClassSubjectService.deleteAcademicClassSubjectFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic class subject deleted successfully',
  });
});

export const AcademicClassSubjectController = {
  createAcademicClassSubject,
  getAllAcademicClassSubjects,
  getAcademicClassSubjectById,
  updateAcademicClassSubject,
  deleteAcademicClassSubject,
};