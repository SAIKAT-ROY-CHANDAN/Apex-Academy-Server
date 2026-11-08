import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CreateOvertimeTeacherConfigInput,
  UpdateOvertimeTeacherConfigInput,
} from './overtimeTeacherConfig.type';

const createOvertimeTeacherConfigIntoDB = async (
  payload: CreateOvertimeTeacherConfigInput,
) => {
  const response = await prisma.overtimeTeacherConfig.create({
    data: {
      teacher_id: payload.teacher_id,
      overtime_hourly_amount: payload.overtime_hourly_amount,
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

const getAllOvertimeTeacherConfigsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, configs] = await prisma.$transaction([
    prisma.overtimeTeacherConfig.count({ where }),
    prisma.overtimeTeacherConfig.findMany({
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

const getOvertimeTeacherConfigByIdFromDB = async (id: string) => {
  const response = await prisma.overtimeTeacherConfig.findUnique({
    where: { id },
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

const updateOvertimeTeacherConfigByIdIntoDB = async (
  id: string,
  payload: UpdateOvertimeTeacherConfigInput,
) => {
  const response = await prisma.overtimeTeacherConfig.update({
    where: { id },
    data: {
      ...(payload.overtime_hourly_amount !== undefined && {
        overtime_hourly_amount: payload.overtime_hourly_amount,
      }),
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

const deleteOvertimeTeacherConfigByIdFromDB = async (id: string) => {
  const response = await prisma.overtimeTeacherConfig.delete({
    where: { id },
  });

  return response;
};

export const OvertimeTeacherConfigService = {
  createOvertimeTeacherConfigIntoDB,
  getAllOvertimeTeacherConfigsFromDB,
  getOvertimeTeacherConfigByIdFromDB,
  updateOvertimeTeacherConfigByIdIntoDB,
  deleteOvertimeTeacherConfigByIdFromDB,
};