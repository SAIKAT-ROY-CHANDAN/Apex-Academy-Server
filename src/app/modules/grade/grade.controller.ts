import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { gradeService } from './grade.service';

const getGradeScale = catchAsync(async (req, res) => {
  const institutionId = (req.query.institutionId as string) || undefined;
  const response = await gradeService.getAllGradeScalesFromDB(institutionId ?? null);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Grade scale retrieved successfully',
    data: response,
  });
});

const getGradeScaleById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await gradeService.getGradeScaleByIdFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Grade scale retrieved successfully',
    data: response,
  });
});

const createGradeScale = catchAsync(async (req, res) => {
  const response = await gradeService.createGradeScaleIntoDB(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Grade scale created successfully',
    data: response,
  });
});

const updateGradeScale = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await gradeService.updateGradeScaleInDB(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Grade scale updated successfully',
    data: response,
  });
});

const deleteGradeScale = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await gradeService.deleteGradeScaleFromDB(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Grade scale deleted successfully',
    data: response,
  });
});

const calculateResult = catchAsync(async (req, res) => {
  const { obtainMarks, totalMarks, institutionId } = req.body as {
    obtainMarks: number;
    totalMarks: number;
    institutionId?: string;
  };

  const scale = await gradeService.getActiveGradeScale(institutionId ?? null);
  const result = gradeService.calculateStudentResult(Number(obtainMarks), Number(totalMarks), scale);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student result calculated successfully',
    data: result,
  });
});

export const gradeController = {
  getGradeScale,
  getGradeScaleById,
  createGradeScale,
  updateGradeScale,
  deleteGradeScale,
  calculateResult,
};
