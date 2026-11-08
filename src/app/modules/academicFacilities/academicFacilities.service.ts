import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IAcademicFacilitiesCreate,
  IAcademicFacilitiesUpdate,
} from './academicFacilities.type';
import { AcademicTuitionType } from '../../../../generated/prisma/enums';

const createAcademicFacilitiesIntoDB = async (
  payload: IAcademicFacilitiesCreate,
) => {
  const result = await prisma.academicFacilities.create({
    data: payload,
  });

  return result;
};

const getAllAcademicFacilitiesFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['name'],
  });

  const [totalItems, facilities] = await prisma.$transaction([
    prisma.academicFacilities.count({ where }),
    prisma.academicFacilities.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: facilities,
  };
};

const getAcademicFacilitiesByIdFromDB = async (id: string) => {
  const existing = await prisma.academicFacilities.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Academic facilities not found');
  }

  return existing;
};

const getAcademicFacilitiesByTypeFromDB = async (
  type: AcademicTuitionType,
) => {
  const facility = await prisma.academicFacilities.findFirst({
    where: { facilities_type: type },
    orderBy: { created_at: 'desc' },
  });

  return facility;
};

const getAllAcademicFacilitiesByTypeFromDB = async (
  type: AcademicTuitionType,
  query: QueryParams,
) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['name'],
  });

  const typeWhere = { ...where, facilities_type: type };

  const [totalItems, facilities] = await prisma.$transaction([
    prisma.academicFacilities.count({ where: typeWhere }),
    prisma.academicFacilities.findMany({
      where: typeWhere,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: facilities,
  };
};

const updateAcademicFacilitiesFromDB = async (
  id: string,
  payload: IAcademicFacilitiesUpdate,
) => {
  const existing = await prisma.academicFacilities.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Academic facilities not found');
  }

  const result = await prisma.academicFacilities.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteAcademicFacilitiesFromDB = async (id: string) => {
  const existing = await prisma.academicFacilities.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Academic facilities not found');
  }

  await prisma.academicFacilities.delete({
    where: { id },
  });
};

export const AcademicFacilitiesService = {
  createAcademicFacilitiesIntoDB,
  getAllAcademicFacilitiesFromDB,
  getAcademicFacilitiesByIdFromDB,
  getAcademicFacilitiesByTypeFromDB,
  getAllAcademicFacilitiesByTypeFromDB,
  updateAcademicFacilitiesFromDB,
  deleteAcademicFacilitiesFromDB,
};
