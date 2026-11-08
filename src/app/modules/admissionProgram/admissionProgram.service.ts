import prisma from '../../../db/db.config';
import { AdmissionProgramType } from '../../../../generated/prisma/enums';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IAdmissionProgramCreate,
  IAdmissionProgramUpdate,
} from './admissionProgram.type';

const createAdmissionProgramIntoDB = async (
  payload: IAdmissionProgramCreate,
) => {
  const result = await prisma.admissionProgram.create({
    data: payload,
  });

  return result;
};

const getAllAdmissionProgramsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['title'],
  });

  const finalOrderBy = orderBy ?? { created_at: 'desc' };

  const [totalItems, admissionPrograms] = await prisma.$transaction([
    prisma.admissionProgram.count({ where }),
    prisma.admissionProgram.findMany({
      where,
      orderBy: finalOrderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: admissionPrograms,
  };
};

const getActiveAdmissionProgramsByType = async (type: AdmissionProgramType) => {
  return prisma.admissionProgram.findMany({
    where: { isActive: true, type },
    orderBy: { order: 'asc' },
  });
};

const getAdmissionProgramByIdFromDB = async (id: string) => {
  const result = await prisma.admissionProgram.findUnique({
    where: { id },
  });

  if (!result) {
    throw new AppError(404, 'Admission program not found');
  }

  return result;
};

const updateAdmissionProgramFromDB = async (
  id: string,
  payload: IAdmissionProgramUpdate,
) => {
  const existing = await prisma.admissionProgram.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Admission program not found');
  }

  const result = await prisma.admissionProgram.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteAdmissionProgramFromDB = async (id: string) => {
  const existing = await prisma.admissionProgram.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Admission program not found');
  }

  await prisma.admissionProgram.delete({
    where: { id },
  });
};

export const AdmissionProgramService = {
  createAdmissionProgramIntoDB,
  getAllAdmissionProgramsFromDB,
  getActiveAdmissionProgramsByType,
  getAdmissionProgramByIdFromDB,
  updateAdmissionProgramFromDB,
  deleteAdmissionProgramFromDB,
};
