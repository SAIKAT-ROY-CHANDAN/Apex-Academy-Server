import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HostelConfigurationService } from './hostel-configuration.service';

const createHostelWithFloors = catchAsync(async (req, res) => {
  const response = await HostelConfigurationService.createHostelConfigurationIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Hostel building and floors created successfully',
    data: response,
  });
});

const assignRoomsToFloor = catchAsync(async (req, res) => {
  const response = await HostelConfigurationService.assignRoomsToFloorIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Rooms assigned to floor successfully',
    data: response,
  });
});

const getAllHostelConfigurations = catchAsync(async (req, res) => {
  const response = await HostelConfigurationService.getAllHostelConfigurationsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel configurations retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getHostelConfigurationById = catchAsync(async (req, res) => {
  const response = await HostelConfigurationService.getHostelConfigurationByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel configuration retrieved successfully',
    data: response,
  });
});

const getHostelFloorById = catchAsync(async (req, res) => {
  const response = await HostelConfigurationService.getHostelFloorByIdFromDB(
    req.params.floorId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel floor retrieved successfully',
    data: response,
  });
});

const getHostelRoomById = catchAsync(async (req, res) => {
  const response = await HostelConfigurationService.getHostelRoomByIdFromDB(
    req.params.roomId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel room retrieved successfully',
    data: response,
  });
});

const updateHostelConfiguration = catchAsync(async (req, res) => {
  const response = await HostelConfigurationService.updateHostelConfigurationFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel configuration updated successfully',
    data: response,
  });
});

const deleteHostelConfiguration = catchAsync(async (req, res) => {
  await HostelConfigurationService.deleteHostelConfigurationFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel building and associated floors deleted successfully',
  });
});

export const HostelConfigurationController = {
  createHostelWithFloors,
  assignRoomsToFloor,
  getAllHostelConfigurations,
  getHostelConfigurationById,
  getHostelFloorById,
  getHostelRoomById,
  updateHostelConfiguration,
  deleteHostelConfiguration,
};
