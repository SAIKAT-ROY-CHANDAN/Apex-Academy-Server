import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AcademicSessionService } from './accademicSession.service';
const createAcademicSession = catchAsync(async (req, res) => {
  const response = await AcademicSessionService.createAcademicSessionIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Academic session created successfully',
    data: response,
  });
});

const getAllAcademicSessions = catchAsync(async (req, res) => {
  const response = await AcademicSessionService.getAllAcademicSessionsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic sessions retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getAcademicSessionById = catchAsync(async (req, res) => {
  const response = await AcademicSessionService.getAcademicSessionByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic session retrieved successfully',
    data: response,
  });
});

const updateAcademicSession = catchAsync(async (req, res) => {
  const response = await AcademicSessionService.updateAcademicSessionFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic session updated successfully',
    data: response,
  });
});

const deleteAcademicSession = catchAsync(async (req, res) => {
  await AcademicSessionService.deleteAcademicSessionFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic session deleted successfully',
  });
});

export const AcademicSessionController = {
  createAcademicSession,
  getAllAcademicSessions,
  getAcademicSessionById,
  updateAcademicSession,
  deleteAcademicSession,
};