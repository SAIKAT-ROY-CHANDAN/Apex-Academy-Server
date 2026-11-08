import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  IWebsiteCtaBannerCreate,
  IWebsiteCtaBannerUpdate,
} from './websiteCtaBanner.type';

const createWebsiteCtaBannerIntoDB = async (
  payload: IWebsiteCtaBannerCreate,
) => {
  const result = await prisma.websiteCtaBanner.create({
    data: payload,
  });

  return result;
};

const getWebsiteCtaBannerFromDB = async () => {
  // Singleton content record — the first row is "the" CTA banner.
  const result = await prisma.websiteCtaBanner.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  return result;
};

const getWebsiteCtaBannerByIdFromDB = async (id: string) => {
  const result = await prisma.websiteCtaBanner.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteCtaBannerFromDB = async (
  id: string,
  payload: IWebsiteCtaBannerUpdate,
) => {
  const existing = await prisma.websiteCtaBanner.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website CTA banner not found');
  }

  const result = await prisma.websiteCtaBanner.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteCtaBannerFromDB = async (id: string) => {
  const existing = await prisma.websiteCtaBanner.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website CTA banner not found');
  }

  await prisma.websiteCtaBanner.delete({
    where: { id },
  });
};

export const WebsiteCtaBannerService = {
  createWebsiteCtaBannerIntoDB,
  getWebsiteCtaBannerFromDB,
  getWebsiteCtaBannerByIdFromDB,
  updateWebsiteCtaBannerFromDB,
  deleteWebsiteCtaBannerFromDB,
};
