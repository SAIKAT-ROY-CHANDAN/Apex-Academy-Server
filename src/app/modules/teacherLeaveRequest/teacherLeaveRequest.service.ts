import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CreateTeacherLeaveRequestInput,
  UpdateTeacherLeaveRequestInput,
} from './teacherLeaveRequest.type';

const createTeacherLeaveRequestIntoDB = async (
  payload: CreateTeacherLeaveRequestInput,
) => {
  const response = await prisma.teacherLeaveRequest.create({
    data: {
      teacher_id: payload.teacher_id,
      leave_start_date: new Date(payload.leave_start_date).toISOString(),
      leave_end_date: new Date(payload.leave_end_date).toISOString(),
      leave_type: payload.leave_type,
      leave_application: payload.leave_application,
      leave_status: payload.leave_status ?? 'PENDING',
    },
    include: {
      teacher: {
        select: {
          id: true,
          full_name: true,
          phone: true,
        },
      },
    },
  });

  return response;
};

const getAllTeacherLeaveRequestsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['leave_type', 'leave_status'],
  });

  const [totalItems, leaveRequests] = await prisma.$transaction([
    prisma.teacherLeaveRequest.count({ where }),
    prisma.teacherLeaveRequest.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        teacher: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            photo: true,
            designation: { select: { id: true, name: true } },
            department: { select: { id: true, department_name: true } },
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: leaveRequests,
  };
};

const getTeacherLeaveRequestByTeacherIdFromDB = async (teacher_id: string, query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['leave_type', 'leave_status'],
  });

  const [totalItems, leaveRequests] = await prisma.$transaction([
    prisma.teacherLeaveRequest.count({ where: { ...where, teacher_id } }),
    prisma.teacherLeaveRequest.findMany({
      where: { ...where, teacher_id },
      orderBy,
      skip,
      take,
      include: {
        teacher: {
          select: {
            id: true,
            full_name: true,
            phone: true,
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: leaveRequests,
  };
};

const getTeacherLeaveRequestByIdFromDB = async (id: string) => {
  const response = await prisma.teacherLeaveRequest.findUnique({
    where: { id },
    include: {
      teacher: {
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          photo: true,
          teacher_type: true,
          administrative_position: true,
          designation: { select: { id: true, name: true } },
          department: { select: { id: true, department_name: true } },
          shift: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!response) return response;

  // The teacher's other leave requests, so the admin reviewing this one has
  // context (previous/pending requests, and this type's usage).
  const otherRequests = await prisma.teacherLeaveRequest.findMany({
    where: {
      teacher_id: response.teacher_id,
      id: { not: response.id },
    },
    orderBy: { created_at: 'desc' },
    take: 10,
    select: {
      id: true,
      leave_start_date: true,
      leave_end_date: true,
      leave_type: true,
      leave_status: true,
    },
  });

  return { ...response, otherRequests };
};

const updateTeacherLeaveRequestByIdIntoDB = async (
  id: string,
  payload: UpdateTeacherLeaveRequestInput,
) => {
  const response = await prisma.teacherLeaveRequest.update({
    where: { id },
    data: {
      ...(payload.leave_start_date && {
        leave_start_date: new Date(payload.leave_start_date).toISOString(),
      }),
      ...(payload.leave_end_date && {
        leave_end_date: new Date(payload.leave_end_date).toISOString(),
      }),
      ...(payload.leave_type && { leave_type: payload.leave_type }),
      ...(payload.leave_application && {
        leave_application: payload.leave_application,
      }),
      ...(payload.leave_status && { leave_status: payload.leave_status }),
    },
    include: {
      teacher: {
        select: {
          id: true,
          full_name: true,
          phone: true,
        },
      },
    },
  });

  return response;
};

const deleteTeacherLeaveRequestByIdFromDB = async (id: string) => {
  const response = await prisma.teacherLeaveRequest.delete({
    where: { id },
  });

  return response;
};

export const TeacherLeaveRequestService = {
  createTeacherLeaveRequestIntoDB,
  getAllTeacherLeaveRequestsFromDB,
  getTeacherLeaveRequestByIdFromDB,
  updateTeacherLeaveRequestByIdIntoDB,
  deleteTeacherLeaveRequestByIdFromDB,
  getTeacherLeaveRequestByTeacherIdFromDB,
};