import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  IWebsiteHeroSectionCreate,
  IWebsiteHeroSectionUpdate,
} from './websiteHeroSection.type';

const createWebsiteHeroSectionIntoDB = async (
  payload: IWebsiteHeroSectionCreate,
) => {
  const result = await prisma.websiteHeroSection.create({
    data: payload,
  });

  return result;
};

const getWebsiteHeroSectionFromDB = async () => {
  // Singleton content record — the first row is "the" hero section.
  const result = await prisma.websiteHeroSection.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  return result;
};

const getWebsiteHeroSectionByIdFromDB = async (id: string) => {
  const result = await prisma.websiteHeroSection.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteHeroSectionFromDB = async (
  id: string,
  payload: IWebsiteHeroSectionUpdate,
) => {
  const existing = await prisma.websiteHeroSection.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website hero section not found');
  }

  const result = await prisma.websiteHeroSection.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteHeroSectionFromDB = async (id: string) => {
  const existing = await prisma.websiteHeroSection.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website hero section not found');
  }

  await prisma.websiteHeroSection.delete({
    where: { id },
  });
};

export const WebsiteHeroSectionService = {
  createWebsiteHeroSectionIntoDB,
  getWebsiteHeroSectionFromDB,
  getWebsiteHeroSectionByIdFromDB,
  updateWebsiteHeroSectionFromDB,
  deleteWebsiteHeroSectionFromDB,
};
