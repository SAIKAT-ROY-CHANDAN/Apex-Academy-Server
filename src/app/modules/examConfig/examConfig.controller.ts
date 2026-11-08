import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AppError from '../../errors/AppError';
import { examConfigService } from './examConfig.service';

const createExamConfig = catchAsync(async (req, res) => {
  const response = await examConfigService.createExamConfigIntoDB(req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Exam config created successfully',
    data: response,
  });
});

const getExamYears = catchAsync(async (req, res) => {
  const years = await examConfigService.getDistinctExamYearsFromDB(
    req.query as unknown as Record<string, unknown> as never,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exam years retrieved successfully',
    data: years,
  });
});

const getAllExamConfigs = catchAsync(async (req, res) => {
  const response = await examConfigService.getAllExamConfigsFromDB(
    req.query as unknown as Record<string, unknown> as never,
  );

  // Support both paginated and non-paginated consumers: if service returns { data, meta }, unwrap compatibly
  const isPaginated = response && typeof response === 'object' && 'data' in response && 'meta' in response;
  if (isPaginated) {
    const paginated = response as { data: unknown; meta: { totalItems: number; totalPages: number; currentPage: number; limit: number } };
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Exam configs retrieved successfully',
      meta: paginated.meta,
      data: paginated.data,
    });
    return;
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exam configs retrieved successfully',
    data: response,
  });
});

const getExamConfigById = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await examConfigService.getExamConfigByIdFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exam config retrieved successfully',
    data: response,
  });
});

const getExamOptions = catchAsync(async (req, res) => {
  const q = req.query as Record<string, unknown>;
  const nonEmpty = (v: unknown): string | undefined => {
    const s = Array.isArray(v) ? v[0] : v;
    return typeof s === 'string' && s.trim() !== '' ? s : undefined;
  };
  const programId = nonEmpty(q.programId ?? q.program_id);
  const departmentId = nonEmpty(q.departmentId ?? q.department_id);
  const classId = nonEmpty(q.classId ?? q.class_id ?? q.academic_class_id);
  const yearRaw = nonEmpty(q.yearLevel ?? q.year_level ?? q.year);
  let yearLevel: number | undefined;
  if (yearRaw !== undefined) {
    yearLevel = Number(yearRaw);
    if (!Number.isInteger(yearLevel)) {
      throw new AppError(400, 'yearLevel must be an integer');
    }
  }

  const response = await examConfigService.getExamOptionsFromDB({
    programId,
    departmentId,
    classId,
    yearLevel,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exam options retrieved successfully',
    data: response,
  });
});

const updateExamConfig = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await examConfigService.updateExamConfigInDB(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exam config updated successfully',
    data: response,
  });
});

const deleteExamConfig = catchAsync(async (req, res) => {
  const id = req.params.id as string;
  const response = await examConfigService.deleteExamConfigFromDB(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Exam config deleted successfully',
    data: response,
  });
});

export const examConfigController = {
  createExamConfig,
  getAllExamConfigs,
  getExamYears,
  getExamOptions,
  getExamConfigById,
  updateExamConfig,
  deleteExamConfig,
};