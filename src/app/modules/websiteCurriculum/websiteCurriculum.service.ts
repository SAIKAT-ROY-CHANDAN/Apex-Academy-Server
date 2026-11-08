import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IWebsiteCurriculumCreate,
  IWebsiteCurriculumUpdate,
} from './websiteCurriculum.type';

const createWebsiteCurriculumIntoDB = async (
  payload: IWebsiteCurriculumCreate,
) => {
  const result = await prisma.websiteCurriculum.create({
    data: payload,
  });

  return result;
};

const getAllWebsiteCurriculumsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['title'],
  });

  const [totalItems, curricula] = await prisma.$transaction([
    prisma.websiteCurriculum.count({ where }),
    prisma.websiteCurriculum.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: curricula,
  };
};

const getWebsiteCurriculumByIdFromDB = async (id: string) => {
  const result = await prisma.websiteCurriculum.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteCurriculumFromDB = async (
  id: string,
  payload: IWebsiteCurriculumUpdate,
) => {
  const existing = await prisma.websiteCurriculum.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Curriculum not found');
  }

  const result = await prisma.websiteCurriculum.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteCurriculumFromDB = async (id: string) => {
  const existing = await prisma.websiteCurriculum.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Curriculum not found');
  }

  await prisma.websiteCurriculum.delete({
    where: { id },
  });
};

export const WebsiteCurriculumService = {
  createWebsiteCurriculumIntoDB,
  getAllWebsiteCurriculumsFromDB,
  getWebsiteCurriculumByIdFromDB,
  updateWebsiteCurriculumFromDB,
  deleteWebsiteCurriculumFromDB,
};
