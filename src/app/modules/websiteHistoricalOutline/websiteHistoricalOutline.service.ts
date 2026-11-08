import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  IWebsiteHistoricalOutlineCreate,
  IWebsiteHistoricalOutlineUpdate,
} from './websiteHistoricalOutline.type';

const createWebsiteHistoricalOutlineIntoDB = async (
  payload: IWebsiteHistoricalOutlineCreate,
) => {
  const result = await prisma.websiteHistoricalOutline.create({
    data: payload,
  });

  return result;
};

const getWebsiteHistoricalOutlineFromDB = async () => {
  // Singleton content record — the first row is "the" historical-outline section.
  const result = await prisma.websiteHistoricalOutline.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  return result;
};

const getWebsiteHistoricalOutlineByIdFromDB = async (id: string) => {
  const result = await prisma.websiteHistoricalOutline.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteHistoricalOutlineFromDB = async (
  id: string,
  payload: IWebsiteHistoricalOutlineUpdate,
) => {
  const existing = await prisma.websiteHistoricalOutline.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website historical outline section not found');
  }

  const result = await prisma.websiteHistoricalOutline.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteHistoricalOutlineFromDB = async (id: string) => {
  const existing = await prisma.websiteHistoricalOutline.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website historical outline section not found');
  }

  await prisma.websiteHistoricalOutline.delete({
    where: { id },
  });
};

export const WebsiteHistoricalOutlineService = {
  createWebsiteHistoricalOutlineIntoDB,
  getWebsiteHistoricalOutlineFromDB,
  getWebsiteHistoricalOutlineByIdFromDB,
  updateWebsiteHistoricalOutlineFromDB,
  deleteWebsiteHistoricalOutlineFromDB,
};
