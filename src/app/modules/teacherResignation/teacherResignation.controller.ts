import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TeacherResignationService } from './teacherResignation.service';

const createTeacherResignation = catchAsync(async (req, res) => {
  const response =
    await TeacherResignationService.createTeacherResignationIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Teacher resignation created successfully',
    data: response,
  });
});

const getAllTeacherResignations = catchAsync(async (req, res) => {
  const { meta, data } =
    await TeacherResignationService.getAllTeacherResignationsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher resignations retrieved successfully',
    meta,
    data,
  });
});

const getTeacherResignationById = catchAsync(async (req, res) => {
  const response =
    await TeacherResignationService.getTeacherResignationByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher resignation retrieved successfully',
    data: response,
  });
});

const getTeacherResignationByTeacherId = catchAsync(async (req, res) => {
  const response =
    await TeacherResignationService.getTeacherResignationByTeacherIdFromDB(
      req.params.teacher_id as string,
      req.query,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher resignations retrieved successfully',
    data: response,
  });
});

const updateTeacherResignationById = catchAsync(async (req, res) => {
  const response =
    await TeacherResignationService.updateTeacherResignationByIdIntoDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher resignation updated successfully',
    data: response,
  });
});

const deleteTeacherResignationById = catchAsync(async (req, res) => {
  const response =
    await TeacherResignationService.deleteTeacherResignationByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher resignation deleted successfully',
    data: response,
  });
});

export const TeacherResignationController = {
  createTeacherResignation,
  getAllTeacherResignations,
  getTeacherResignationById,
  getTeacherResignationByTeacherId,
  updateTeacherResignationById,
  deleteTeacherResignationById,
};