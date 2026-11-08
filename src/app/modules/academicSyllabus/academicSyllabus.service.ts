import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IAcademicSyllabusCreate,
  IAcademicSyllabusUpdate,
} from './academicSyllabus.type';

const createAcademicSyllabusIntoDB = async (payload: IAcademicSyllabusCreate) => {
  const result = await prisma.academicSyllabus.create({
    data: payload,
  });

  return result;
};

const getAllAcademicSyllabusesFromDB = async (query: QueryParams) => {
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

  const [totalItems, syllabuses] = await prisma.$transaction([
    prisma.academicSyllabus.count({ where }),
    prisma.academicSyllabus.findMany({
      where,
      orderBy: effectiveOrderBy,
      skip: cappedSkip,
      take: cappedTake,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, cappedTake),
    data: syllabuses,
  };
};

const getAcademicSyllabusByIdFromDB = async (id: string) => {
  const existing = await prisma.academicSyllabus.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Academic syllabus not found');
  }

  return existing;
};

const updateAcademicSyllabusFromDB = async (
  id: string,
  payload: IAcademicSyllabusUpdate,
) => {
  const existing = await prisma.academicSyllabus.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Academic syllabus not found');
  }

  const result = await prisma.academicSyllabus.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteAcademicSyllabusFromDB = async (id: string) => {
  const existing = await prisma.academicSyllabus.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Academic syllabus not found');
  }

  await prisma.academicSyllabus.delete({
    where: { id },
  });
};

export const AcademicSyllabusService = {
  createAcademicSyllabusIntoDB,
  getAllAcademicSyllabusesFromDB,
  getAcademicSyllabusByIdFromDB,
  updateAcademicSyllabusFromDB,
  deleteAcademicSyllabusFromDB,
};
