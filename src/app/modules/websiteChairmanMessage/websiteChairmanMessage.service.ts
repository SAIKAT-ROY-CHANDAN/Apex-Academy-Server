import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  IWebsiteChairmanMessageCreate,
  IWebsiteChairmanMessageUpdate,
} from './websiteChairmanMessage.type';

const createWebsiteChairmanMessageIntoDB = async (
  payload: IWebsiteChairmanMessageCreate,
) => {
  const result = await prisma.websiteChairmanMessage.create({
    data: payload,
  });

  return result;
};

const getWebsiteChairmanMessageFromDB = async () => {
  // Singleton content record — the first row is "the" chairman message.
  const result = await prisma.websiteChairmanMessage.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  return result;
};

const getWebsiteChairmanMessageByIdFromDB = async (id: string) => {
  const result = await prisma.websiteChairmanMessage.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteChairmanMessageFromDB = async (
  id: string,
  payload: IWebsiteChairmanMessageUpdate,
) => {
  const existing = await prisma.websiteChairmanMessage.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website chairman message not found');
  }

  const result = await prisma.websiteChairmanMessage.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteChairmanMessageFromDB = async (id: string) => {
  const existing = await prisma.websiteChairmanMessage.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website chairman message not found');
  }

  await prisma.websiteChairmanMessage.delete({
    where: { id },
  });
};

export const WebsiteChairmanMessageService = {
  createWebsiteChairmanMessageIntoDB,
  getWebsiteChairmanMessageFromDB,
  getWebsiteChairmanMessageByIdFromDB,
  updateWebsiteChairmanMessageFromDB,
  deleteWebsiteChairmanMessageFromDB,
};
