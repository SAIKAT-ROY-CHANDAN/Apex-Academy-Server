import prisma from '../../../db/db.config';
import { buildPrismaQuery, calculatePaginationMeta, QueryParams } from '../../builders/prismaBuilderQuery';
import { CreateStudentLeaveRequestInput, UpdateStudentLeaveRequestInput } from './studentLeaveRequest.type';

const studentInclude = {
  student: {
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
      student_phone: true,
      father_phone: true,
      gender: true,
      studentEnrollments: {
        // Only the current (primary) enrollment — a promoted student owns
        // closed history rows too, and callers must not get [0] of N rows.
        where: { is_primary: true },
        select: {
          is_primary: true,
          roll_number: true,
          registration_number: true,
          academicClass: { select: { id: true, class_name: true, class_level: true } },
          academicSection: { select: { id: true, section_name: true } },
          academicSession: { select: { id: true, session_name: true } },
          batch: { select: { id: true, batch_name: true } },
        },
        orderBy: { created_at: 'desc' as const },
        take: 1,
      },
    },
  },
} as const;

const createStudentLeaveRequestIntoDB = async (payload: CreateStudentLeaveRequestInput) => {
  const response = await prisma.studentLeaveRequest.create({
    data: {
      student_id: payload.student_id,
      leave_type: payload.leave_type,
      reason: payload.reason,
      start_date: new Date(payload.start_date),
      end_date: new Date(payload.end_date),
      status: payload.status ?? 'PENDING',
    },
    include: studentInclude,
  });
  return response;
};

const getAllStudentLeaveRequestsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['leave_type', 'status', 'reason'],
  });

  const [totalItems, leaveRequests] = await prisma.$transaction([
    prisma.studentLeaveRequest.count({ where }),
    prisma.studentLeaveRequest.findMany({
      where,
      orderBy,
      skip,
      take,
      include: studentInclude,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: leaveRequests,
  };
};

const getStudentLeaveRequestsByStudentIdFromDB = async (student_id: string, query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['leave_type', 'status', 'reason'],
  });

  const [totalItems, leaveRequests] = await prisma.$transaction([
    prisma.studentLeaveRequest.count({ where: { ...where, student_id } }),
    prisma.studentLeaveRequest.findMany({
      where: { ...where, student_id },
      orderBy,
      skip,
      take,
      include: studentInclude,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: leaveRequests,
  };
};

const getStudentLeaveRequestByIdFromDB = async (id: string) => {
  const response = await prisma.studentLeaveRequest.findUnique({
    where: { id },
    include: studentInclude,
  });
  return response;
};

const updateStudentLeaveRequestByIdIntoDB = async (id: string, payload: UpdateStudentLeaveRequestInput) => {
  const response = await prisma.studentLeaveRequest.update({
    where: { id },
    data: {
      ...(payload.start_date && { start_date: new Date(payload.start_date) }),
      ...(payload.end_date && { end_date: new Date(payload.end_date) }),
      ...(payload.leave_type && { leave_type: payload.leave_type }),
      ...(payload.reason && { reason: payload.reason }),
      ...(payload.status && { status: payload.status }),
    },
    include: studentInclude,
  });
  return response;
};

const deleteStudentLeaveRequestByIdFromDB = async (id: string) => {
  const response = await prisma.studentLeaveRequest.delete({
    where: { id },
  });
  return response;
};

const getStudentLeaveStatsFromDB = async (student_id?: string) => {
  const where = student_id ? { student_id } : {};
  const [total, pending, approved, rejected] = await prisma.$transaction([
    prisma.studentLeaveRequest.count({ where }),
    prisma.studentLeaveRequest.count({ where: { ...where, status: 'PENDING' } }),
    prisma.studentLeaveRequest.count({ where: { ...where, status: 'APPROVED' } }),
    prisma.studentLeaveRequest.count({ where: { ...where, status: 'REJECTED' } }),
  ]);
  return { total, pending, approved, rejected };
};

export const StudentLeaveRequestService = {
  createStudentLeaveRequestIntoDB,
  getAllStudentLeaveRequestsFromDB,
  getStudentLeaveRequestsByStudentIdFromDB,
  getStudentLeaveRequestByIdFromDB,
  updateStudentLeaveRequestByIdIntoDB,
  deleteStudentLeaveRequestByIdFromDB,
  getStudentLeaveStatsFromDB,
};
