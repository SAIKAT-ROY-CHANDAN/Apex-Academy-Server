import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IWebsiteCareerDevelopmentApplicationCreate } from './websiteCareerDevelopmentApplication.type';

const createWebsiteCareerDevelopmentApplicationIntoDB = async (
  payload: IWebsiteCareerDevelopmentApplicationCreate,
) => {
  const programme = await prisma.websiteCareerDevelopmentProgramme.findUnique({
    where: { id: payload.programmeId },
    select: { id: true },
  });

  if (!programme) {
    throw new AppError(404, 'Career development programme not found');
  }

  const result = await prisma.websiteCareerDevelopmentApplication.create({
    data: {
      programmeId: payload.programmeId,
      fullName: payload.fullName,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
      address: payload.address ?? null,
    },
  });

  return result;
};

const getAllWebsiteCareerDevelopmentApplicationsFromDB = async (
  query: QueryParams,
) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['fullName', 'phone', 'email'],
  });

  const finalOrderBy = orderBy ?? { created_at: 'desc' };

  const [totalItems, applications] = await prisma.$transaction([
    prisma.websiteCareerDevelopmentApplication.count({ where }),
    prisma.websiteCareerDevelopmentApplication.findMany({
      where,
      orderBy: finalOrderBy,
      skip,
      take,
      include: {
        programme: {
          select: { programName: true },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: applications,
  };
};

const getWebsiteCareerDevelopmentApplicationsByProgrammeFromDB = async (
  programmeId: string,
) => {
  const programme = await prisma.websiteCareerDevelopmentProgramme.findUnique({
    where: { id: programmeId },
    select: { id: true },
  });

  if (!programme) {
    throw new AppError(404, 'Career development programme not found');
  }

  const applications = await prisma.websiteCareerDevelopmentApplication.findMany(
    {
      where: { programmeId },
      orderBy: { created_at: 'desc' },
    },
  );

  return applications;
};

const getWebsiteCareerDevelopmentApplicationByIdFromDB = async (id: string) => {
  const result = await prisma.websiteCareerDevelopmentApplication.findUnique({
    where: { id },
    include: {
      programme: { select: { programName: true } },
    },
  });

  if (!result) {
    throw new AppError(404, 'Career development application not found');
  }

  return result;
};

const deleteWebsiteCareerDevelopmentApplicationFromDB = async (id: string) => {
  const existing = await prisma.websiteCareerDevelopmentApplication.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Career development application not found');
  }

  await prisma.websiteCareerDevelopmentApplication.delete({
    where: { id },
  });
};

export const WebsiteCareerDevelopmentApplicationService = {
  createWebsiteCareerDevelopmentApplicationIntoDB,
  getAllWebsiteCareerDevelopmentApplicationsFromDB,
  getWebsiteCareerDevelopmentApplicationsByProgrammeFromDB,
  getWebsiteCareerDevelopmentApplicationByIdFromDB,
  deleteWebsiteCareerDevelopmentApplicationFromDB,
};