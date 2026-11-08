import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AcademicSectionService } from './academicSection.service';

const createAcademicSection = catchAsync(async (req, res) => {
  const response = await AcademicSectionService.createAcademicSectionIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Academic section created successfully',
    data: response,
  });
});

const getAllAcademicSections = catchAsync(async (req, res) => {
  const response = await AcademicSectionService.getAllAcademicSectionsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic sections retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getFilteredSections = catchAsync(async (req, res) => {
  const response = await AcademicSectionService.getFilteredSectionsForExamFromDB(
    req.query as unknown as { programId?: string; departmentId?: string; classId?: string },
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sections retrieved successfully',
    data: response,
  });
});

const getAcademicSectionById = catchAsync(async (req, res) => {
  const response = await AcademicSectionService.getAcademicSectionByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic section retrieved successfully',
    data: response,
  });
});

const updateAcademicSection = catchAsync(async (req, res) => {
  const response = await AcademicSectionService.updateAcademicSectionFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic section updated successfully',
    data: response,
  });
});

const deleteAcademicSection = catchAsync(async (req, res) => {
  await AcademicSectionService.deleteAcademicSectionFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Academic section deleted successfully',
  });
});

export const AcademicSectionController = {
  createAcademicSection,
  getAllAcademicSections,
  getFilteredSections,
  getAcademicSectionById,
  updateAcademicSection,
  deleteAcademicSection,
};