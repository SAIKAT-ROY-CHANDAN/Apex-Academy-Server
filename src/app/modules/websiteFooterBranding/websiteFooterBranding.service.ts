import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  IWebsiteFooterBrandingCreate,
  IWebsiteFooterBrandingUpdate,
} from './websiteFooterBranding.type';

const createWebsiteFooterBrandingIntoDB = async (
  payload: IWebsiteFooterBrandingCreate,
) => {
  const result = await prisma.websiteFooterBranding.create({
    data: payload,
  });

  return result;
};

const getWebsiteFooterBrandingFromDB = async () => {
  const result = await prisma.websiteFooterBranding.findFirst({
    orderBy: { createdAt: 'asc' },
  });

  return result;
};

const getWebsiteFooterBrandingByIdFromDB = async (id: string) => {
  const result = await prisma.websiteFooterBranding.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteFooterBrandingFromDB = async (
  id: string,
  payload: IWebsiteFooterBrandingUpdate,
) => {
  const existing = await prisma.websiteFooterBranding.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website footer branding not found');
  }

  const result = await prisma.websiteFooterBranding.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteFooterBrandingFromDB = async (id: string) => {
  const existing = await prisma.websiteFooterBranding.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website footer branding not found');
  }

  await prisma.websiteFooterBranding.delete({
    where: { id },
  });
};

export const WebsiteFooterBrandingService = {
  createWebsiteFooterBrandingIntoDB,
  getWebsiteFooterBrandingFromDB,
  getWebsiteFooterBrandingByIdFromDB,
  updateWebsiteFooterBrandingFromDB,
  deleteWebsiteFooterBrandingFromDB,
};