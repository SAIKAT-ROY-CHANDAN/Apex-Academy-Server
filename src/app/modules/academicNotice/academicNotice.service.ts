import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IAcademicNoticeCreate,
  IAcademicNoticeUpdate,
} from './academicNotice.type';

const createAcademicNoticeIntoDB = async (payload: IAcademicNoticeCreate) => {
  const result = await prisma.academicNotice.create({
    data: payload,
  });

  return result;
};

const getAllAcademicNoticesFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['title'],
  });

  const [totalItems, notices] = await prisma.$transaction([
    prisma.academicNotice.count({ where }),
    prisma.academicNotice.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: notices,
  };
};

const getAcademicNoticeByIdFromDB = async (id: string) => {
  const existing = await prisma.academicNotice.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Academic notice not found');
  }

  return existing;
};

const updateAcademicNoticeFromDB = async (
  id: string,
  payload: IAcademicNoticeUpdate,
) => {
  const existing = await prisma.academicNotice.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Academic notice not found');
  }

  const result = await prisma.academicNotice.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteAcademicNoticeFromDB = async (id: string) => {
  const existing = await prisma.academicNotice.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Academic notice not found');
  }

  await prisma.academicNotice.delete({
    where: { id },
  });
};

export const AcademicNoticeService = {
  createAcademicNoticeIntoDB,
  getAllAcademicNoticesFromDB,
  getAcademicNoticeByIdFromDB,
  updateAcademicNoticeFromDB,
  deleteAcademicNoticeFromDB,
};
