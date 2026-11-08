import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { HostelDashboardSummaryService } from './hostelDashboardSummary.service';

const getHostelDashboardSummary = catchAsync(async (req, res) => {
  const data = await HostelDashboardSummaryService.getHostelDashboardSummary(
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Hostel dashboard summary retrieved successfully',
    data,
  });
});

export const HostelDashboardSummaryController = {
  getHostelDashboardSummary,
};
