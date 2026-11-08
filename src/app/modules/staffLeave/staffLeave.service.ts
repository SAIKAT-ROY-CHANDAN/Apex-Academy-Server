import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CreateStaffLeaveInput,
  UpdateStaffLeaveInput,
} from './staffLeave.type';

const createStaffLeaveIntoDB = async (payload: CreateStaffLeaveInput) => {
  const response = await prisma.staffLeave.create({
    data: {
      staff_id: payload.staff_id,
      leave_start_date: new Date(payload.leave_start_date),
      leave_end_date: new Date(payload.leave_end_date),
      leave_type: payload.leave_type,
      leave_application: payload.leave_application,
      leave_status: payload.leave_status ?? 'PENDING',
    },
    include: {
      staff: {
        select: {
          id: true,
          full_name: true,
          phone: true,
          designation: { select: { id: true, name: true } },
        },
      },
    },
  });

  return response;
};

const getAllStaffLeavesFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['leave_type', 'leave_status'],
  });

  const [totalItems, leaves] = await prisma.$transaction([
    prisma.staffLeave.count({ where }),
    prisma.staffLeave.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        staff: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            designation: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: leaves,
  };
};

const getStaffLeaveByIdFromDB = async (id: string) => {
  const response = await prisma.staffLeave.findUnique({
    where: { id },
    include: {
      staff: {
        select: {
          id: true,
          full_name: true,
          phone: true,
          designation: { select: { id: true, name: true } },
        },
      },
    },
  });

  return response;
};

const updateStaffLeaveByIdIntoDB = async (
  id: string,
  payload: UpdateStaffLeaveInput,
) => {
  const response = await prisma.staffLeave.update({
    where: { id },
    data: {
      ...(payload.leave_start_date && {
        leave_start_date: new Date(payload.leave_start_date),
      }),
      ...(payload.leave_end_date && {
        leave_end_date: new Date(payload.leave_end_date),
      }),
      ...(payload.leave_type && { leave_type: payload.leave_type }),
      ...(payload.leave_application && {
        leave_application: payload.leave_application,
      }),
      ...(payload.leave_status && { leave_status: payload.leave_status }),
    },
    include: {
      staff: {
        select: {
          id: true,
          full_name: true,
          phone: true,
          designation: { select: { id: true, name: true } },
        },
      },
    },
  });

  return response;
};

const deleteStaffLeaveByIdFromDB = async (id: string) => {
  const response = await prisma.staffLeave.delete({
    where: { id },
  });

  return response;
};

export const StaffLeaveService = {
  createStaffLeaveIntoDB,
  getAllStaffLeavesFromDB,
  getStaffLeaveByIdFromDB,
  updateStaffLeaveByIdIntoDB,
  deleteStaffLeaveByIdFromDB,
};
