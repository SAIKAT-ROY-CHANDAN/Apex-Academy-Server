import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ProgramService } from './program.service';

const createProgram = catchAsync(async (req, res) => {
  const response = await ProgramService.createProgramIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Program created successfully',
    data: response,
  });
});

const getAllPrograms = catchAsync(async (req, res) => {
  const response = await ProgramService.getAllProgramsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Programs retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getProgramById = catchAsync(async (req, res) => {
  const response = await ProgramService.getProgramByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Program retrieved successfully',
    data: response,
  });
});

const updateProgram = catchAsync(async (req, res) => {
  const response = await ProgramService.updateProgramFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Program updated successfully',
    data: response,
  });
});

const deleteProgram = catchAsync(async (req, res) => {
  await ProgramService.deleteProgramFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Program deleted successfully',
  });
});

export const ProgramController = {
  createProgram,
  getAllPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
};