import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HostelFeeCollectionService } from './hostel-fee-collection.service';

const createHostelFeeCollection = catchAsync(async (req, res) => {
  const response = await HostelFeeCollectionService.createHostelFeeCollectionIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Hostel fee collection created successfully',
    data: response,
  });
});

const payHostelDue = catchAsync(async (req, res) => {
  const response = await HostelFeeCollectionService.payHostelDueFromDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Hostel due payment recorded successfully',
    data: response,
  });
});

const initiateBkashPayment = catchAsync(async (req, res) => {
  const studentId = req.user?.id as string;
  const response = await HostelFeeCollectionService.initiateBkashPaymentFromDB(
    studentId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'bKash payment initiated successfully',
    data: response,
  });
});

const executeBkashPayment = catchAsync(async (req, res) => {
  const studentId = req.user?.id as string;
  const { paymentID } = req.body;
  const response = await HostelFeeCollectionService.executeBkashPaymentFromDB(
    paymentID,
    studentId,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Hostel due paid successfully via bKash',
    data: response,
  });
});

const getAllHostelFeeCollections = catchAsync(async (req, res) => {
  const response = await HostelFeeCollectionService.getAllHostelFeeCollectionsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel fee collections retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getHostelFeeCollectionById = catchAsync(async (req, res) => {
  const response = await HostelFeeCollectionService.getHostelFeeCollectionByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel fee collection retrieved successfully',
    data: response,
  });
});

const getStudentHostelDue = catchAsync(async (req, res) => {
  const response = await HostelFeeCollectionService.getStudentHostelDueFromDB(
    req.params.studentId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student hostel due retrieved successfully',
    data: response,
  });
});

const getMyHostelDue = catchAsync(async (req, res) => {
  const studentId = req.user?.id as string;
  const response = await HostelFeeCollectionService.getStudentHostelDueFromDB(
    studentId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student hostel due retrieved successfully',
    data: response,
  });
});

const updateHostelFeeCollection = catchAsync(async (req, res) => {
  const response = await HostelFeeCollectionService.updateHostelFeeCollectionFromDB(
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel fee collection updated successfully',
    data: response,
  });
});

const deleteHostelFeeCollection = catchAsync(async (req, res) => {
  await HostelFeeCollectionService.deleteHostelFeeCollectionFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel fee collection deleted successfully',
  });
});


const queryBkashPaymentStatus = catchAsync(async (req, res) => {
  const { paymentID } = req.params;
  const response =
    await HostelFeeCollectionService.queryBkashPaymentStatusFromDB(
      paymentID as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'bKash payment status retrieved successfully',
    data: response,
  });
});

export const HostelFeeCollectionController = {
  queryBkashPaymentStatus,
  createHostelFeeCollection,
  payHostelDue,
  initiateBkashPayment,
  executeBkashPayment,
  getAllHostelFeeCollections,
  getHostelFeeCollectionById,
  getStudentHostelDue,
  getMyHostelDue,
  updateHostelFeeCollection,
  deleteHostelFeeCollection,
};
