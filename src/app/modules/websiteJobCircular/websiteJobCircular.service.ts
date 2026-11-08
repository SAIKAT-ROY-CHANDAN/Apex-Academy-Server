import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IWebsiteJobCircularCreate,
  IWebsiteJobCircularUpdate,
} from './websiteJobCircular.type';

const createWebsiteJobCircularIntoDB = async (
  payload: IWebsiteJobCircularCreate,
) => {
  const result = await prisma.websiteJobCircular.create({
    data: payload,
  });

  return result;
};

const getAllWebsiteJobCircularsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['positionName', 'positionType', 'educationalQualification'],
  });

  const [totalItems, jobs] = await prisma.$transaction([
    prisma.websiteJobCircular.count({ where }),
    prisma.websiteJobCircular.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: jobs,
  };
};

const getWebsiteJobCircularByIdFromDB = async (id: string) => {
  const result = await prisma.websiteJobCircular.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteJobCircularFromDB = async (
  id: string,
  payload: IWebsiteJobCircularUpdate,
) => {
  const existing = await prisma.websiteJobCircular.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website job circular not found');
  }

  const result = await prisma.websiteJobCircular.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteJobCircularFromDB = async (id: string) => {
  const existing = await prisma.websiteJobCircular.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website job circular not found');
  }

  await prisma.websiteJobCircular.delete({
    where: { id },
  });
};

export const WebsiteJobCircularService = {
  createWebsiteJobCircularIntoDB,
  getAllWebsiteJobCircularsFromDB,
  getWebsiteJobCircularByIdFromDB,
  updateWebsiteJobCircularFromDB,
  deleteWebsiteJobCircularFromDB,
};
