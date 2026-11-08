import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  IWebsiteContactUsCreate,
  IWebsiteContactUsUpdate,
} from './websiteContactUs.type';

const createWebsiteContactUsIntoDB = async (
  payload: IWebsiteContactUsCreate,
) => {
  const result = await prisma.websiteContactUs.create({
    data: payload,
  });

  return result;
};

const getWebsiteContactUsFromDB = async () => {
  // Singleton — first row is the contact us section.
  const result = await prisma.websiteContactUs.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  return result;
};

const getWebsiteContactUsByIdFromDB = async (id: string) => {
  const result = await prisma.websiteContactUs.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteContactUsFromDB = async (
  id: string,
  payload: IWebsiteContactUsUpdate,
) => {
  const existing = await prisma.websiteContactUs.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Contact Us not found');
  }

  const result = await prisma.websiteContactUs.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteContactUsFromDB = async (id: string) => {
  const existing = await prisma.websiteContactUs.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Contact Us not found');
  }

  await prisma.websiteContactUs.delete({
    where: { id },
  });
};

export const WebsiteContactUsService = {
  createWebsiteContactUsIntoDB,
  getWebsiteContactUsFromDB,
  getWebsiteContactUsByIdFromDB,
  updateWebsiteContactUsFromDB,
  deleteWebsiteContactUsFromDB,
};
