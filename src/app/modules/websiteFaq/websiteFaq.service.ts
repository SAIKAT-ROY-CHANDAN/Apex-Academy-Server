import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IWebsiteFaqCreate, IWebsiteFaqUpdate } from './websiteFaq.type';

const createWebsiteFaqIntoDB = async (payload: IWebsiteFaqCreate) => {
  const result = await prisma.websiteFaq.create({
    data: payload,
  });

  return result;
};

const createManyWebsiteFaqIntoDB = async (
  items: IWebsiteFaqCreate[],
) => {
  const result = await prisma.websiteFaq.createMany({
    data: items,
  });

  return result;
};

const getAllWebsiteFaqsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['question', 'answer'],
  });

  const [totalItems, faqs] = await prisma.$transaction([
    prisma.websiteFaq.count({ where }),
    prisma.websiteFaq.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: faqs,
  };
};

const getWebsiteFaqByIdFromDB = async (id: string) => {
  const result = await prisma.websiteFaq.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteFaqFromDB = async (
  id: string,
  payload: IWebsiteFaqUpdate,
) => {
  const existing = await prisma.websiteFaq.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'FAQ not found');
  }

  const result = await prisma.websiteFaq.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteFaqFromDB = async (id: string) => {
  const existing = await prisma.websiteFaq.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'FAQ not found');
  }

  await prisma.websiteFaq.delete({
    where: { id },
  });
};

export const WebsiteFaqService = {
  createWebsiteFaqIntoDB,
  createManyWebsiteFaqIntoDB,
  getAllWebsiteFaqsFromDB,
  getWebsiteFaqByIdFromDB,
  updateWebsiteFaqFromDB,
  deleteWebsiteFaqFromDB,
};
