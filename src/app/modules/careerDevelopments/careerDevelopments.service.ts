import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  ICareerDevelopmentsCreate,
  ICareerDevelopmentsUpdate,
} from './careerDevelopments.type';

const createCareerDevelopmentsIntoDB = async (
  payload: ICareerDevelopmentsCreate,
) => {
  const result = await prisma.careerDevelopments.create({
    data: payload,
  });

  return result;
};

const getAllCareerDevelopmentsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['title'],
  });

  const finalOrderBy = orderBy ?? { created_at: 'desc' };

  const [totalItems, careerDevelopments] = await prisma.$transaction([
    prisma.careerDevelopments.count({ where }),
    prisma.careerDevelopments.findMany({
      where,
      orderBy: finalOrderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: careerDevelopments,
  };
};

const getActiveCareerDevelopmentsFromDB = async () => {
  return prisma.careerDevelopments.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
};

const getCareerDevelopmentsByIdFromDB = async (id: string) => {
  const result = await prisma.careerDevelopments.findUnique({
    where: { id },
  });

  if (!result) {
    throw new AppError(404, 'Career development not found');
  }

  return result;
};

const updateCareerDevelopmentsFromDB = async (
  id: string,
  payload: ICareerDevelopmentsUpdate,
) => {
  const existing = await prisma.careerDevelopments.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Career development not found');
  }

  const result = await prisma.careerDevelopments.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteCareerDevelopmentsFromDB = async (id: string) => {
  const existing = await prisma.careerDevelopments.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Career development not found');
  }

  await prisma.careerDevelopments.delete({
    where: { id },
  });
};

export const CareerDevelopmentsService = {
  createCareerDevelopmentsIntoDB,
  getAllCareerDevelopmentsFromDB,
  getActiveCareerDevelopmentsFromDB,
  getCareerDevelopmentsByIdFromDB,
  updateCareerDevelopmentsFromDB,
  deleteCareerDevelopmentsFromDB,
};