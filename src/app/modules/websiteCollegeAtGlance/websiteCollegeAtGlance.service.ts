import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  IWebsiteCollegeAtGlanceCreate,
  IWebsiteCollegeAtGlanceUpdate,
} from './websiteCollegeAtGlance.type';

const createWebsiteCollegeAtGlanceIntoDB = async (
  payload: IWebsiteCollegeAtGlanceCreate,
) => {
  const result = await prisma.websiteCollegeAtGlance.create({
    data: payload,
  });

  return result;
};

const getWebsiteCollegeAtGlanceFromDB = async () => {
  // Singleton content record — the first row is "the" college-at-a-glance section.
  const result = await prisma.websiteCollegeAtGlance.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  return result;
};

const getWebsiteCollegeAtGlanceByIdFromDB = async (id: string) => {
  const result = await prisma.websiteCollegeAtGlance.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteCollegeAtGlanceFromDB = async (
  id: string,
  payload: IWebsiteCollegeAtGlanceUpdate,
) => {
  const existing = await prisma.websiteCollegeAtGlance.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website college at a glance section not found');
  }

  const result = await prisma.websiteCollegeAtGlance.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteCollegeAtGlanceFromDB = async (id: string) => {
  const existing = await prisma.websiteCollegeAtGlance.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website college at a glance section not found');
  }

  await prisma.websiteCollegeAtGlance.delete({
    where: { id },
  });
};

export const WebsiteCollegeAtGlanceService = {
  createWebsiteCollegeAtGlanceIntoDB,
  getWebsiteCollegeAtGlanceFromDB,
  getWebsiteCollegeAtGlanceByIdFromDB,
  updateWebsiteCollegeAtGlanceFromDB,
  deleteWebsiteCollegeAtGlanceFromDB,
};
