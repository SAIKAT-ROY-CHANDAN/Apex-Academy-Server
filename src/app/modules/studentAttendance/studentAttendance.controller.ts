import { StudentGroup } from "../../../../generated/prisma/enums";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StudentAttendanceService } from "./studentAttendance.service";

const createStudentAttendance = catchAsync(async (req, res) => {
  const response = await StudentAttendanceService.createStudentAttendanceIntoDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Student attendance created successfully',
    data: response,
  });
});

const createManyStudentAttendances = catchAsync(async (req, res) => {
  const response =
    await StudentAttendanceService.createManyStudentAttendancesIntoDB(
      req.body?.attendances ?? [],
    );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: `${response.count} student attendance record(s) created successfully`,
    data: response,
  });
});

const getTodayAttendanceStatus = catchAsync(async (req, res) => {
  const response =
    await StudentAttendanceService.getTodayAttendanceStatusFromDB({
      academic_class_id: req.query.academic_class_id as string | undefined,
      subject_id: req.query.subject_id as string | undefined,
      group: req.query.group as StudentGroup | undefined,
      teacher_id: req.query.teacher_id as string | undefined,
      attendance_date: req.query.attendance_date as string | undefined,
    });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Today attendance status retrieved successfully',
    data: response,
  });
});

const getClassTakenReport = catchAsync(async (req, res) => {
  const response = await StudentAttendanceService.getClassTakenReportFromDB({
    academic_class_id: req.query.academic_class_id as string | undefined,
    program_id: req.query.program_id as string | undefined,
    department_id: req.query.department_id as string | undefined,
    subject_id: req.query.subject_id as string | undefined,
    teacher_id: req.query.teacher_id as string | undefined,
    administrative_position: req.query.administrative_position as
      | string
      | undefined,
    group: req.query.group as StudentGroup | undefined,
    start_date: req.query.start_date as string | undefined,
    end_date: req.query.end_date as string | undefined,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Class taken report retrieved successfully',
    meta: response.meta,
    data: response.data,
  });
});

const getAllStudentAttendances = catchAsync(async (req, res) => {
  const { meta, data } =
    await StudentAttendanceService.getAllStudentAttendancesFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student attendances retrieved successfully',
    meta,
    data,
  });
});

const getStudentAttendanceById = catchAsync(async (req, res) => {
  const response =
    await StudentAttendanceService.getStudentAttendanceByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student attendance retrieved successfully',
    data: response,
  });
});

const updateStudentAttendanceById = catchAsync(async (req, res) => {
  const response =
    await StudentAttendanceService.updateStudentAttendanceByIdIntoDB(
      req.params.id as string,
      req.body,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student attendance updated successfully',
    data: response,
  });
});

const updateManyStudentAttendances = catchAsync(async (req, res) => {
  const requester = req.user as { id: string; userType?: string } | undefined;
  const response =
    await StudentAttendanceService.updateManyStudentAttendancesIntoDB(
      req.body?.updates ?? [],
      requester ? { id: requester.id, userType: requester.userType } : undefined,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `${response.count} student attendance record(s) updated successfully`,
    data: response,
  });
});

const deleteStudentAttendanceById = catchAsync(async (req, res) => {
  const response =
    await StudentAttendanceService.deleteStudentAttendanceByIdFromDB(
      req.params.id as string,
    );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Student attendance deleted successfully',
    data: response,
  });
});

export const StudentAttendanceController = {
  createStudentAttendance,
  createManyStudentAttendances,
  getTodayAttendanceStatus,
  getClassTakenReport,
  getAllStudentAttendances,
  getStudentAttendanceById,
  updateStudentAttendanceById,
  updateManyStudentAttendances,
  deleteStudentAttendanceById,
};