import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IWebsiteHeadOfDepartmentCreate,
  IWebsiteHeadOfDepartmentUpdate,
} from './websiteHeadOfDepartment.type';

const createWebsiteHeadOfDepartmentIntoDB = async (
  payload: IWebsiteHeadOfDepartmentCreate,
) => {
  const result = await prisma.websiteHeadOfDepartment.create({
    data: payload,
  });

  return result;
};

const getAllWebsiteHeadOfDepartmentsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['name', 'designation', 'departmentName'],
  });

  const [totalItems, members] = await prisma.$transaction([
    prisma.websiteHeadOfDepartment.count({ where }),
    prisma.websiteHeadOfDepartment.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: members,
  };
};

const getWebsiteHeadOfDepartmentByIdFromDB = async (id: string) => {
  const result = await prisma.websiteHeadOfDepartment.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteHeadOfDepartmentFromDB = async (
  id: string,
  payload: IWebsiteHeadOfDepartmentUpdate,
) => {
  const existing = await prisma.websiteHeadOfDepartment.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website head of department not found');
  }

  const result = await prisma.websiteHeadOfDepartment.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteHeadOfDepartmentFromDB = async (id: string) => {
  const existing = await prisma.websiteHeadOfDepartment.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website head of department not found');
  }

  await prisma.websiteHeadOfDepartment.delete({
    where: { id },
  });
};

export const WebsiteHeadOfDepartmentService = {
  createWebsiteHeadOfDepartmentIntoDB,
  getAllWebsiteHeadOfDepartmentsFromDB,
  getWebsiteHeadOfDepartmentByIdFromDB,
  updateWebsiteHeadOfDepartmentFromDB,
  deleteWebsiteHeadOfDepartmentFromDB,
};
