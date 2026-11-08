import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { examScheduleService } from './examSchedule.service';

const createExamSchedule = catchAsync(async (req, res) => {
  const response = await examScheduleService.createExamScheduleIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Exam schedule created successfully',
    data: response,
  });
});

const getAllExamSchedules = catchAsync(async (req, res) => {
  const response = await examScheduleService.getAllExamSchedulesFromDB(req.query as Record<string, string>);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exam schedules retrieved successfully',
    data: response,
  });
});

const getSubjectsWithScheduledExam = catchAsync(async (req, res) => {
  const { academicClassId, programId, departmentId, year, examTakenYear } = req.query as Record<string, string>;
  const filters: Record<string, unknown> = {};
  if (academicClassId) filters.academicClassId = String(academicClassId);
  if (programId) filters.programId = String(programId);
  if (departmentId) filters.departmentId = String(departmentId);
  if (year) filters.year = Number(year);
  if (examTakenYear) filters.examTakenYear = Number(examTakenYear);
  const response = await examScheduleService.getSubjectsWithScheduledExamFromDB(filters as never);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Subjects with scheduled exam retrieved successfully',
    data: response,
  });
});

const getExamConfigsWithScheduledExam = catchAsync(async (req, res) => {
  const { academicClassId, programId, departmentId, subjectId, year, examTakenYear } = req.query as Record<string, string>;
  const filters: Record<string, unknown> = {};
  if (academicClassId) filters.academicClassId = String(academicClassId);
  if (programId) filters.programId = String(programId);
  if (departmentId) filters.departmentId = String(departmentId);
  if (subjectId) filters.subjectId = String(subjectId);
  if (year) filters.year = Number(year);
  if (examTakenYear) filters.examTakenYear = Number(examTakenYear);
  const response = await examScheduleService.getExamConfigsWithScheduledExamFromDB(filters as never);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exam configs with scheduled exam retrieved successfully',
    data: response,
  });
});

const getExamScheduleById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await examScheduleService.getExamScheduleByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exam schedule retrieved successfully',
    data: response,
  });
});

const updateExamSchedule = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await examScheduleService.updateExamScheduleInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exam schedule updated successfully',
    data: response,
  });
});

const deleteExamSchedule = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await examScheduleService.deleteExamScheduleFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exam schedule deleted successfully',
    data: response,
  });
});

export const examScheduleController = {
  createExamSchedule,
  getAllExamSchedules,
  getSubjectsWithScheduledExam,
  getExamConfigsWithScheduledExam,
  getExamScheduleById,
  updateExamSchedule,
  deleteExamSchedule,
};