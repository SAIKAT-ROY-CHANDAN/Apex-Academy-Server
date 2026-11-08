import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { QueryParams } from '../../builders/prismaBuilderQuery';
import { reportService } from './report.service';

const getAllFinanceReportsOverview = catchAsync(async (req, res) => {
  const response = await reportService.allFinanceReportsOverview();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Finance reports overview retrieved successfully',
    data: response,
  });
});

const getOrganizationalExpensesReport = catchAsync(async (req, res) => {
  const response = await reportService.getOrganizationalExpensesReport(
    req.query as QueryParams,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Organizational expenses report retrieved successfully',
    data: response,
  });
});

const getOrganizationalIncomeReport = catchAsync(async (req, res) => {
  const response = await reportService.getOrganizationalIncomeReport(
    req.query as QueryParams,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Organizational income report retrieved successfully',
    data: response,
  });
});


const getStudentCollectionReport = catchAsync(async (req, res) => {
  const response = await reportService.getStudentCollectionReport(
    req.query as QueryParams,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student collection report retrieved successfully',
    data: response,
  });
});

const getStudentDueReport = catchAsync(async (req, res) => {
  const response = await reportService.getStudentDueReport(
    req.query as QueryParams,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student due report retrieved successfully',
    data: response,
  });
});

export const reportController = {
  getAllFinanceReportsOverview,
  getOrganizationalExpensesReport,
  getOrganizationalIncomeReport,
  getStudentCollectionReport,
  getStudentDueReport,
};
