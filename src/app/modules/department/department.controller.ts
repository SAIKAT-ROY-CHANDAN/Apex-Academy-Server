import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DepartmentService } from './department.service';

const createDepartment = catchAsync(async (req, res) => {
  const response = await DepartmentService.createDepartmentIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Department created successfully',
    data: response,
  });
});

const getAllDepartments = catchAsync(async (req, res) => {
  const response = await DepartmentService.getAllDepartmentsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Departments retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getDepartmentById = catchAsync(async (req, res) => {
  const response = await DepartmentService.getDepartmentByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Department retrieved successfully',
    data: response,
  });
});
const getDepartmentByProgramId = catchAsync(async (req, res) => {
  const response = await DepartmentService.getDepartmentByProgramIdFromDB(
    req.params.programId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Department retrieved successfully',
    data: response,
  });
});
const getDepartmentsByProgramId = catchAsync(async (req, res) => {
  const response = await DepartmentService.getDepartmentsByProgramIdFromDB(
    req.params.programId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Department retrieved successfully',
    data: response,
  });
});

const updateDepartment = catchAsync(async (req, res) => {
  const response = await DepartmentService.updateDepartmentFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Department updated successfully',
    data: response,
  });
});

const deleteDepartment = catchAsync(async (req, res) => {
  await DepartmentService.deleteDepartmentFromDB(req.params.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Department deleted successfully',
  });
});

export const DepartmentController = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  getDepartmentByProgramId,
  getDepartmentsByProgramId
};