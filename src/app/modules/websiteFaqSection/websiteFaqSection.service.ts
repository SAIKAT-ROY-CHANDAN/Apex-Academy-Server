import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  IWebsiteFaqSectionCreate,
  IWebsiteFaqSectionUpdate,
} from './websiteFaqSection.type';

const createWebsiteFaqSectionIntoDB = async (
  payload: IWebsiteFaqSectionCreate,
) => {
  const result = await prisma.websiteFaqSection.create({
    data: payload,
  });

  return result;
};

const getWebsiteFaqSectionFromDB = async () => {
  // Singleton — first row is the FAQ section header.
  const result = await prisma.websiteFaqSection.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  return result;
};

const getWebsiteFaqSectionByIdFromDB = async (id: string) => {
  const result = await prisma.websiteFaqSection.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteFaqSectionFromDB = async (
  id: string,
  payload: IWebsiteFaqSectionUpdate,
) => {
  const existing = await prisma.websiteFaqSection.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'FAQ section not found');
  }

  const result = await prisma.websiteFaqSection.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteFaqSectionFromDB = async (id: string) => {
  const existing = await prisma.websiteFaqSection.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'FAQ section not found');
  }

  await prisma.websiteFaqSection.delete({
    where: { id },
  });
};

export const WebsiteFaqSectionService = {
  createWebsiteFaqSectionIntoDB,
  getWebsiteFaqSectionFromDB,
  getWebsiteFaqSectionByIdFromDB,
  updateWebsiteFaqSectionFromDB,
  deleteWebsiteFaqSectionFromDB,
};
