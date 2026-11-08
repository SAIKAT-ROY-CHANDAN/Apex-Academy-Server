import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import {
  TeacherPayrollService,
  calculateTeacherPayroll,
} from './teacherPayroll.service';

const createTeacherPayroll = catchAsync(async (req, res) => {
  const response = await TeacherPayrollService.payTeacherPayroll({
    ...req.body,
    paid_by_admin_id: req.user?.id,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Teacher payroll created successfully',
    data: response,
  });
});

const calculateTeacherPayrollPreview = catchAsync(async (req, res) => {
  const teacherId = (req.query.teacherId ?? req.body?.teacherId) as string;
  const month = Number(req.query.month ?? req.body?.month);
  const year = Number(req.query.year ?? req.body?.year);

  const response = await calculateTeacherPayroll({
    teacherId,
    month,
    year,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher payroll calculated successfully',
    data: response,
  });
});

const previewAllTeacherPayrolls = catchAsync(async (req, res) => {
  const month = Number(req.query.month);
  const year = Number(req.query.year);

  const response = await TeacherPayrollService.previewPayroll(
    month,
    year,
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher payroll preview retrieved successfully',
    data: response,
  });
});

const getTeacherPayrollHistory = catchAsync(async (req, res) => {
  const id = req.query.teacherId as string;
  const response = await TeacherPayrollService.getTeacherPayrollHistoryIntoDB(
    id,
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Teacher payroll history retrieved successfully',
    data: response.data,
    meta: response.meta,
    summary: response.summary,
  });
});

export const TeacherPayrollController = {
  createTeacherPayroll,
  calculateTeacherPayrollPreview,
  previewAllTeacherPayrolls,
  getTeacherPayrollHistory,
};
