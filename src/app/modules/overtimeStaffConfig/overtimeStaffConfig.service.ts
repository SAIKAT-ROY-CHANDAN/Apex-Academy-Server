import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CreateOvertimeStaffConfigInput,
  UpdateOvertimeStaffConfigInput,
} from './overtimeStaffConfig.type';

const createOvertimeStaffConfigIntoDB = async (
  payload: CreateOvertimeStaffConfigInput,
) => {
  const response = await prisma.overtimeStaffConfig.create({
    data: {
      staff_id: payload.staff_id,
      overtime_hourly_amount: payload.overtime_hourly_amount,
    },
    include: {
      staff: {
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

const getAllOvertimeStaffConfigsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, configs] = await prisma.$transaction([
    prisma.overtimeStaffConfig.count({ where }),
    prisma.overtimeStaffConfig.findMany({
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
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: configs,
  };
};

const getOvertimeStaffConfigByIdFromDB = async (id: string) => {
  const response = await prisma.overtimeStaffConfig.findUnique({
    where: { id },
    include: {
      staff: {
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

const updateOvertimeStaffConfigByIdIntoDB = async (
  id: string,
  payload: UpdateOvertimeStaffConfigInput,
) => {
  const response = await prisma.overtimeStaffConfig.update({
    where: { id },
    data: {
      ...(payload.overtime_hourly_amount !== undefined && {
        overtime_hourly_amount: payload.overtime_hourly_amount,
      }),
    },
    include: {
      staff: {
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

const deleteOvertimeStaffConfigByIdFromDB = async (id: string) => {
  const response = await prisma.overtimeStaffConfig.delete({
    where: { id },
  });

  return response;
};

export const OvertimeStaffConfigService = {
  createOvertimeStaffConfigIntoDB,
  getAllOvertimeStaffConfigsFromDB,
  getOvertimeStaffConfigByIdFromDB,
  updateOvertimeStaffConfigByIdIntoDB,
  deleteOvertimeStaffConfigByIdFromDB,
};
