import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HostelAllocationService } from './hostel-allocation.service';

const createHostelAllocation = catchAsync(async (req, res) => {
  const response = await HostelAllocationService.createHostelAllocationIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Hostel allocated to student successfully',
    data: response,
  });
});

const getAllHostelAllocations = catchAsync(async (req, res) => {
  const response = await HostelAllocationService.getAllHostelAllocationsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel allocations retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getHostelAllocationById = catchAsync(async (req, res) => {
  const response = await HostelAllocationService.getHostelAllocationByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel allocation retrieved successfully',
    data: response,
  });
});

const updateHostelAllocation = catchAsync(async (req, res) => {
  const response = await HostelAllocationService.updateHostelAllocationFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel allocation updated successfully',
    data: response,
  });
});

const deleteHostelAllocation = catchAsync(async (req, res) => {
  await HostelAllocationService.deleteHostelAllocationFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel allocation removed successfully',
  });
});

export const getAllocatedHostelStudents = catchAsync(async (req, res) => {
  const response = await HostelAllocationService.getAllocatedHostelStudentsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Allocated hostel students retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const checkoutHostelAllocation = catchAsync(async (req, res) => {
  const response = await HostelAllocationService.checkoutHostelAllocationFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel allocation checked out successfully',
    data: response,
  });
});

const getStudentAllocationHistory = catchAsync(async (req, res) => {
  const response =
    await HostelAllocationService.getStudentAllocationHistoryFromDB(
      req.params.studentId as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel allocation history retrieved successfully',
    data: response,
  });
});

export const HostelAllocationController = {
  createHostelAllocation,
  getAllHostelAllocations,
  getHostelAllocationById,
  updateHostelAllocation,
  deleteHostelAllocation,
  getAllocatedHostelStudents,
  checkoutHostelAllocation,
  getStudentAllocationHistory,
};
