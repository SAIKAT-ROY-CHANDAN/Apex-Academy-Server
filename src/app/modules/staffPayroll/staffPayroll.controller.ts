import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import {
  StaffPayrollService,
  calculateStaffPayroll,
} from './staffPayroll.service';

const createStaffPayroll = catchAsync(async (req, res) => {
  const response = await StaffPayrollService.payStaffPayroll({
    ...req.body,
    paid_by_admin_id: req.user?.id,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Staff payroll created successfully',
    data: response,
  });
});

const calculateStaffPayrollPreview = catchAsync(async (req, res) => {
  const staffId = (req.query.staffId ?? req.body?.staffId) as string;
  const month = Number(req.query.month ?? req.body?.month);
  const year = Number(req.query.year ?? req.body?.year);

  const response = await calculateStaffPayroll({
    staffId,
    month,
    year,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff payroll calculated successfully',
    data: response,
  });
});

const previewAllStaffPayrolls = catchAsync(async (req, res) => {
  const month = Number(req.query.month);
  const year = Number(req.query.year);

  const response = await StaffPayrollService.previewPayroll(month, year);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff payroll preview retrieved successfully',
    data: response,
  });
});

const getStaffPayrollHistory = catchAsync(async (req, res) => {
  const id = req.query.staffId as string;
  const response = await StaffPayrollService.getStaffPayrollHistoryIntoDB(
    id,
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Staff payroll history retrieved successfully',
    data: response.data,
    meta: response.meta,
    summary: response.summary,
  });
});

export const StaffPayrollController = {
  createStaffPayroll,
  calculateStaffPayrollPreview,
  previewAllStaffPayrolls,
  getStaffPayrollHistory,
};
