import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { gradeSystemService } from './gradeSystem.service';

const createGradeSystem = catchAsync(async (req, res) => {
  const response = await gradeSystemService.createGradeSystemIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Grade system created successfully',
    data: response,
  });
});

const getAllGradeSystems = catchAsync(async (req, res) => {
  const response = await gradeSystemService.getAllGradeSystemsFromDB();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Grade systems retrieved successfully',
    data: response,
  });
});

const getGradeSystemById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await gradeSystemService.getGradeSystemByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Grade system retrieved successfully',
    data: response,
  });
});

const updateGradeSystem = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await gradeSystemService.updateGradeSystemInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Grade system updated successfully',
    data: response,
  });
});

const deleteGradeSystem = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await gradeSystemService.deleteGradeSystemFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Grade system deleted successfully',
    data: response,
  });
});

export const gradeSystemController = {
  createGradeSystem,
  getAllGradeSystems,
  getGradeSystemById,
  updateGradeSystem,
  deleteGradeSystem,
};