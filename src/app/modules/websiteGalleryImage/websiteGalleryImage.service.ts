import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IWebsiteGalleryImageCreate,
  IWebsiteGalleryImageUpdate,
} from './websiteGalleryImage.type';

const createWebsiteGalleryImageIntoDB = async (
  payload: IWebsiteGalleryImageCreate,
) => {
  const result = await prisma.websiteGalleryImage.create({
    data: payload,
  });

  return result;
};

const getAllWebsiteGalleryImagesFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['title', 'description'],
  });

  const [totalItems, images] = await prisma.$transaction([
    prisma.websiteGalleryImage.count({ where }),
    prisma.websiteGalleryImage.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: images,
  };
};

const getWebsiteGalleryImageByIdFromDB = async (id: string) => {
  const result = await prisma.websiteGalleryImage.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteGalleryImageFromDB = async (
  id: string,
  payload: IWebsiteGalleryImageUpdate,
) => {
  const existing = await prisma.websiteGalleryImage.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Gallery image not found');
  }

  const result = await prisma.websiteGalleryImage.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteGalleryImageFromDB = async (id: string) => {
  const existing = await prisma.websiteGalleryImage.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Gallery image not found');
  }

  await prisma.websiteGalleryImage.delete({
    where: { id },
  });
};

export const WebsiteGalleryImageService = {
  createWebsiteGalleryImageIntoDB,
  getAllWebsiteGalleryImagesFromDB,
  getWebsiteGalleryImageByIdFromDB,
  updateWebsiteGalleryImageFromDB,
  deleteWebsiteGalleryImageFromDB,
};
