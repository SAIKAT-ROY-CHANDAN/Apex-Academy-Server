import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  IWebsitePrincipalMessageCreate,
  IWebsitePrincipalMessageUpdate,
} from './websitePrincipalMessage.type';

const createWebsitePrincipalMessageIntoDB = async (
  payload: IWebsitePrincipalMessageCreate,
) => {
  const result = await prisma.websitePrincipalMessage.create({
    data: payload,
  });

  return result;
};

const getWebsitePrincipalMessageFromDB = async () => {
  // Singleton content record — the first row is "the" principal message.
  const result = await prisma.websitePrincipalMessage.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  return result;
};

const getWebsitePrincipalMessageByIdFromDB = async (id: string) => {
  const result = await prisma.websitePrincipalMessage.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsitePrincipalMessageFromDB = async (
  id: string,
  payload: IWebsitePrincipalMessageUpdate,
) => {
  const existing = await prisma.websitePrincipalMessage.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website principal message not found');
  }

  const result = await prisma.websitePrincipalMessage.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsitePrincipalMessageFromDB = async (id: string) => {
  const existing = await prisma.websitePrincipalMessage.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website principal message not found');
  }

  await prisma.websitePrincipalMessage.delete({
    where: { id },
  });
};

export const WebsitePrincipalMessageService = {
  createWebsitePrincipalMessageIntoDB,
  getWebsitePrincipalMessageFromDB,
  getWebsitePrincipalMessageByIdFromDB,
  updateWebsitePrincipalMessageFromDB,
  deleteWebsitePrincipalMessageFromDB,
};
