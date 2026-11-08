import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { SubjectService } from './subject.service';

const createSubject = catchAsync(async (req, res) => {
  const response = await SubjectService.createSubjectIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Subjects created successfully',
    data: response,
  });
});

const getAllSubjects = catchAsync(async (req, res) => {
  const response = await SubjectService.getAllSubjectsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subjects retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getSubjectById = catchAsync(async (req, res) => {
  const response = await SubjectService.getSubjectByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subject retrieved successfully',
    data: response,
  });
});

const updateSubject = catchAsync(async (req, res) => {
  const response = await SubjectService.updateSubjectFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subject updated successfully',
    data: response,
  });
});

const deleteSubject = catchAsync(async (req, res) => {
  await SubjectService.deleteSubjectFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subject deleted successfully',
  });
});

export const SubjectController = {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};