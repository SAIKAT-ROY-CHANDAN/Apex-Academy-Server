import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IWebsiteDepartmentCreate,
  IWebsiteDepartmentUpdate,
} from './websiteDepartment.type';

const createWebsiteDepartmentIntoDB = async (
  payload: IWebsiteDepartmentCreate,
) => {
  const result = await prisma.websiteDepartment.create({
    data: payload,
  });

  return result;
};

const getAllWebsiteDepartmentsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['name'],
  });

  const [totalItems, departments] = await prisma.$transaction([
    prisma.websiteDepartment.count({ where }),
    prisma.websiteDepartment.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: departments,
  };
};

const getWebsiteDepartmentByIdFromDB = async (id: string) => {
  const result = await prisma.websiteDepartment.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteDepartmentFromDB = async (
  id: string,
  payload: IWebsiteDepartmentUpdate,
) => {
  const existing = await prisma.websiteDepartment.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website department not found');
  }

  const result = await prisma.websiteDepartment.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteDepartmentFromDB = async (id: string) => {
  const existing = await prisma.websiteDepartment.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website department not found');
  }

  await prisma.websiteDepartment.delete({
    where: { id },
  });
};

export const WebsiteDepartmentService = {
  createWebsiteDepartmentIntoDB,
  getAllWebsiteDepartmentsFromDB,
  getWebsiteDepartmentByIdFromDB,
  updateWebsiteDepartmentFromDB,
  deleteWebsiteDepartmentFromDB,
};
