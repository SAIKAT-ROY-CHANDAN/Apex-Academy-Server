import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IWebsiteCareerDevelopmentProgrammeCreate,
  IWebsiteCareerDevelopmentProgrammeUpdate,
} from './websiteCareerDevelopmentProgramme.type';

const createWebsiteCareerDevelopmentProgrammeIntoDB = async (
  payload: IWebsiteCareerDevelopmentProgrammeCreate,
) => {
  const result = await prisma.websiteCareerDevelopmentProgramme.create({
    data: payload,
  });

  return result;
};

const getAllWebsiteCareerDevelopmentProgrammesFromDB = async (
  query: QueryParams,
) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['programName'],
  });

  const [totalItems, programmes] = await prisma.$transaction([
    prisma.websiteCareerDevelopmentProgramme.count({ where }),
    prisma.websiteCareerDevelopmentProgramme.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: programmes,
  };
};

const getWebsiteCareerDevelopmentProgrammeByIdFromDB = async (id: string) => {
  const result = await prisma.websiteCareerDevelopmentProgramme.findUniqueOrThrow(
    {
      where: { id },
    },
  );

  return result;
};

const updateWebsiteCareerDevelopmentProgrammeFromDB = async (
  id: string,
  payload: IWebsiteCareerDevelopmentProgrammeUpdate,
) => {
  const existing =
    await prisma.websiteCareerDevelopmentProgramme.findUnique({
      where: { id },
    });

  if (!existing) {
    throw new AppError(404, 'Website career development programme not found');
  }

  const result = await prisma.websiteCareerDevelopmentProgramme.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteCareerDevelopmentProgrammeFromDB = async (id: string) => {
  const existing =
    await prisma.websiteCareerDevelopmentProgramme.findUnique({
      where: { id },
    });

  if (!existing) {
    throw new AppError(404, 'Website career development programme not found');
  }

  await prisma.websiteCareerDevelopmentProgramme.delete({
    where: { id },
  });
};

export const WebsiteCareerDevelopmentProgrammeService = {
  createWebsiteCareerDevelopmentProgrammeIntoDB,
  getAllWebsiteCareerDevelopmentProgrammesFromDB,
  getWebsiteCareerDevelopmentProgrammeByIdFromDB,
  updateWebsiteCareerDevelopmentProgrammeFromDB,
  deleteWebsiteCareerDevelopmentProgrammeFromDB,
};