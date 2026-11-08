import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IIDCardGenerateLogCreate,
  IIDCardGenerateLogUpdate,
} from './idCardGenerateLog.type';

const createIDCardGenerateLogIntoDB = async (
  payload: IIDCardGenerateLogCreate,
) => {
  const newIDCardGenerateLog = await prisma.iDCardGenerateLog.create({
    data: payload,
  });

  return newIDCardGenerateLog;
};

const getAllIDCardGenerateLogsFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, idCardGenerateLogs] = await prisma.$transaction([
    prisma.iDCardGenerateLog.count({ where }),
    prisma.iDCardGenerateLog.findMany({
      skip,
      take,
      orderBy,
      where,
      include: {
        student: true,
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: idCardGenerateLogs,
  };
};

const getIDCardGenerateLogByIdFromDB = async (idCardGenerateLogId: string) => {
  const existingIDCardGenerateLog = await prisma.iDCardGenerateLog.findUnique(
    {
      where: {
        id: idCardGenerateLogId,
      },
      include: {
        student: true,
      },
    },
  );

  if (!existingIDCardGenerateLog) {
    throw new Error('ID card generate log not found');
  }

  return existingIDCardGenerateLog;
};

const updateIDCardGenerateLogFromDB = async (
  idCardGenerateLogId: string,
  payload: IIDCardGenerateLogUpdate,
) => {
  const existingIDCardGenerateLog = await prisma.iDCardGenerateLog.findUnique(
    {
      where: {
        id: idCardGenerateLogId,
      },
    },
  );

  if (!existingIDCardGenerateLog) {
    throw new Error('ID card generate log not found');
  }

  const updatedIDCardGenerateLog = await prisma.iDCardGenerateLog.update({
    where: {
      id: idCardGenerateLogId,
    },
    data: payload,
  });

  return updatedIDCardGenerateLog;
};

const deleteIDCardGenerateLogFromDB = async (idCardGenerateLogId: string) => {
  const existingIDCardGenerateLog = await prisma.iDCardGenerateLog.findUnique(
    {
      where: {
        id: idCardGenerateLogId,
      },
    },
  );

  if (!existingIDCardGenerateLog) {
    throw new Error('ID card generate log not found');
  }

  await prisma.iDCardGenerateLog.delete({
    where: {
      id: idCardGenerateLogId,
    },
  });
};

export const IDCardGenerateLogService = {
  createIDCardGenerateLogIntoDB,
  getAllIDCardGenerateLogsFromDB,
  getIDCardGenerateLogByIdFromDB,
  updateIDCardGenerateLogFromDB,
  deleteIDCardGenerateLogFromDB,
};