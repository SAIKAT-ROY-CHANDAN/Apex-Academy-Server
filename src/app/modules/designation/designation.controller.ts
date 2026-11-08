import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DesignationService } from './designation.service';

const createDesignation = catchAsync(async (req, res) => {
  const response = await DesignationService.createDesignationIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Designation created successfully',
    data: response,
  });
});

const getAllDesignation = catchAsync(async (req, res) => {
  const { meta, data } = await DesignationService.getAllDesignationFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Designations retrieved successfully',
    meta,
    data,
  });
});

const getDesignationById = catchAsync(async (req, res) => {
  const response = await DesignationService.getDesignationByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Designation retrieved successfully',
    data: response,
  });
});

const updateDesignationById = catchAsync(async (req, res) => {
  const response = await DesignationService.updateDesignationByIdIntoDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Designation updated successfully',
    data: response,
  });
});

const deleteDesignationById = catchAsync(async (req, res) => {
  const response = await DesignationService.deleteDesignationByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Designation deleted successfully',
    data: response,
  });
});

export const test = () => {
  console.log('test');
}

export const DesignationController = {
  createDesignation,
  getAllDesignation,
  getDesignationById,
  updateDesignationById,
  deleteDesignationById,
};
