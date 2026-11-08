import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IAcademicTuitionCreate,
  IAcademicTuitionUpdate,
} from './academicTuition.type';

const createAcademicTuitionIntoDB = async (payload: IAcademicTuitionCreate) => {
  const result = await prisma.academicTuition.create({
    data: payload,
  });

  return result;
};

const getAllAcademicTuitionsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['title'],
  });

  // Enforce max limit 20 and ensure latest first (created_at desc) by default
  const cappedTake = Math.min(take, 20);
  const cappedSkip = (page - 1) * cappedTake;
  const effectiveOrderBy =
    orderBy && Object.keys(orderBy).length > 0
      ? orderBy
      : { created_at: 'desc' };

  const [totalItems, tuitions] = await prisma.$transaction([
    prisma.academicTuition.count({ where }),
    prisma.academicTuition.findMany({
      where,
      orderBy: effectiveOrderBy,
      skip: cappedSkip,
      take: cappedTake,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, cappedTake),
    data: tuitions,
  };
};

const getAcademicTuitionByIdFromDB = async (id: string) => {
  const existing = await prisma.academicTuition.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Academic tuition not found');
  }

  return existing;
};

const updateAcademicTuitionFromDB = async (
  id: string,
  payload: IAcademicTuitionUpdate,
) => {
  const existing = await prisma.academicTuition.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Academic tuition not found');
  }

  const result = await prisma.academicTuition.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteAcademicTuitionFromDB = async (id: string) => {
  const existing = await prisma.academicTuition.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Academic tuition not found');
  }

  await prisma.academicTuition.delete({
    where: { id },
  });
};

export const AcademicTuitionService = {
  createAcademicTuitionIntoDB,
  getAllAcademicTuitionsFromDB,
  getAcademicTuitionByIdFromDB,
  updateAcademicTuitionFromDB,
  deleteAcademicTuitionFromDB,
};
