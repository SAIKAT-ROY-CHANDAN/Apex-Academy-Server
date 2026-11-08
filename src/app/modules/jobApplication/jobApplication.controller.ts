import { Request } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import configs from '../../configs';
import { getSingleImageUrl, getSinglePdfUrl } from '../../utils/getUrl';
import { ACCEPTED_IMAGE_TYPES } from '../../constant/acceptedTypes';
import { JobApplicationService } from './jobApplication.service';

const urlForUpload = (
  req: Request,
  file: Express.Multer.File | undefined,
): string | null => {
  if (!file || !file.filename) return null;
  return ACCEPTED_IMAGE_TYPES.includes(file.mimetype)
    ? getSingleImageUrl(req, file)
    : getSinglePdfUrl(req, file);
};

const initiateJobApplication = catchAsync(async (req, res) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const callbackURL = `${configs.frontendUrl}/job-apply-callback`;

  const response = await JobApplicationService.initiateJobApplicationPaymentIntoDB(
    {
      ...req.body,
      imageUrl: urlForUpload(req, files?.image?.[0]),
      certificateUrl: urlForUpload(req, files?.certificate?.[0]),
      cvUrl: urlForUpload(req, files?.cv?.[0]),
    },
    callbackURL,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Application submitted. Complete the bKash payment to finish.',
    data: response,
  });
});

const executeJobApplication = catchAsync(async (req, res) => {
  const response = await JobApplicationService.executeJobApplicationPaymentIntoDB(
    req.body.paymentID as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment verified and application submitted successfully',
    data: response,
  });
});

const getAllJobApplications = catchAsync(async (req, res) => {
  const response = await JobApplicationService.getAllJobApplicationsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job applications retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getJobApplicationById = catchAsync(async (req, res) => {
  const response = await JobApplicationService.getJobApplicationByIdFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job application retrieved successfully',
    data: response,
  });
});

const deleteJobApplication = catchAsync(async (req, res) => {
  await JobApplicationService.deleteJobApplicationFromDB(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Job application deleted successfully',
  });
});

export const JobApplicationController = {
  initiateJobApplication,
  executeJobApplication,
  getAllJobApplications,
  getJobApplicationById,
  deleteJobApplication,
};