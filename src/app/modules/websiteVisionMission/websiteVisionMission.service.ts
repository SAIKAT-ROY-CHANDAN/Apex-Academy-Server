import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  IWebsiteVisionMissionCreate,
  IWebsiteVisionMissionUpdate,
} from './websiteVisionMission.type';

const createWebsiteVisionMissionIntoDB = async (
  payload: IWebsiteVisionMissionCreate,
) => {
  const result = await prisma.websiteVisionMission.create({
    data: payload,
  });

  return result;
};

const getWebsiteVisionMissionFromDB = async () => {
  // Singleton content record — the first row is "the" vision & mission section.
  const result = await prisma.websiteVisionMission.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  return result;
};

const getWebsiteVisionMissionByIdFromDB = async (id: string) => {
  const result = await prisma.websiteVisionMission.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteVisionMissionFromDB = async (
  id: string,
  payload: IWebsiteVisionMissionUpdate,
) => {
  const existing = await prisma.websiteVisionMission.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website vision & mission section not found');
  }

  const result = await prisma.websiteVisionMission.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteVisionMissionFromDB = async (id: string) => {
  const existing = await prisma.websiteVisionMission.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website vision & mission section not found');
  }

  await prisma.websiteVisionMission.delete({
    where: { id },
  });
};

export const WebsiteVisionMissionService = {
  createWebsiteVisionMissionIntoDB,
  getWebsiteVisionMissionFromDB,
  getWebsiteVisionMissionByIdFromDB,
  updateWebsiteVisionMissionFromDB,
  deleteWebsiteVisionMissionFromDB,
};
