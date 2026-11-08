import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { DashboardService } from './dashboard.service';

const getDashboardOverview = catchAsync(async (req, res) => {
  const response = await DashboardService.getDashboardOverviewFromDB(
    req.query as { startDate?: string; endDate?: string; filter?: string },
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Dashboard overview retrieved successfully',
    data: response,
  });
});

export const DashboardController = {
  getDashboardOverview,
};