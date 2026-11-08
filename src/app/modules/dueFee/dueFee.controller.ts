import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DueFeeService } from './dueFee.service';

const getAllDueFees = catchAsync(async (req, res) => {
  const response = await DueFeeService.getAllDueFeesFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Due fees retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const exportDueFees = catchAsync(async (req, res) => {
  const data = await DueFeeService.exportDueFeesFromDB(req.query as any);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Due fees exported successfully',
    data,
  });
});

export const DueFeeController = {
  getAllDueFees,
  exportDueFees,
};
