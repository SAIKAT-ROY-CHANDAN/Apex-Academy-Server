import prisma from '../../../db/db.config';
import { deleteImage } from '../../utils/deleteFile';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IWebsitePrincipalCreate,
  IWebsitePrincipalUpdate,
} from './websitePrincipal.type';

const createWebsitePrincipalIntoDB = async (
  payload: IWebsitePrincipalCreate,
) => {
  const result = await prisma.websitePrincipal.create({
    data: {
      name: payload.name,
      photoUrl: payload.photoUrl ?? null,
      fromDate: new Date(payload.fromDate),
      toDate: new Date(payload.toDate),
    },
  });
  return result;
};

const getAllWebsitePrincipalsFromDB = async (query: QueryParams & { search?: string }) => {
  // Support ?search= and ?searchTerm= (frontend uses searchTerm)
  const searchTerm = (query as any).search ?? query.searchTerm;
  const normalizedQuery = { ...query, searchTerm };

  const builtQuery = buildPrismaQuery(normalizedQuery as QueryParams, {
    searchFields: ['name'],
  });
  const { skip, take, where, page } = builtQuery;

  // buildPrismaQuery defaults to { created_at: 'desc' }, but the WebsitePrincipal
  // model uses `createdAt` as the Prisma field name — map it so ordering works.
  const orderBy =
    builtQuery.orderBy && 'created_at' in (builtQuery.orderBy as Record<string, unknown>)
      ? { createdAt: 'desc' }
      : (builtQuery.orderBy ?? { createdAt: 'desc' });

  const [totalItems, data] = await prisma.$transaction([
    prisma.websitePrincipal.count({ where }),
    prisma.websitePrincipal.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data,
  };
};

const getWebsitePrincipalByIdFromDB = async (id: string) => {
  const result = await prisma.websitePrincipal.findUniqueOrThrow({
    where: { id },
  });
  return result;
};

const updateWebsitePrincipalFromDB = async (
  id: string,
  payload: IWebsitePrincipalUpdate,
) => {
  const existing = await prisma.websitePrincipal.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Principal not found');
  }

  const data: any = {};
  if (payload.name !== undefined) data.name = payload.name;
  if (payload.photoUrl !== undefined) data.photoUrl = payload.photoUrl;
  if (payload.fromDate !== undefined) data.fromDate = new Date(payload.fromDate);
  if (payload.toDate !== undefined) data.toDate = new Date(payload.toDate);

  // If photo is being replaced, delete old file (if it was a local /images URL)
  if (payload.photoUrl && existing.photoUrl && payload.photoUrl !== existing.photoUrl) {
    deleteImage(existing.photoUrl);
  }
  // If explicitly clearing photo (null), delete old
  if (payload.photoUrl === null && existing.photoUrl) {
    deleteImage(existing.photoUrl);
  }

  const result = await prisma.websitePrincipal.update({
    where: { id },
    data,
  });

  return result;
};

const deleteWebsitePrincipalFromDB = async (id: string) => {
  const existing = await prisma.websitePrincipal.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Principal not found');
  }

  if (existing.photoUrl) {
    deleteImage(existing.photoUrl);
  }

  await prisma.websitePrincipal.delete({
    where: { id },
  });
};

export const WebsitePrincipalService = {
  createWebsitePrincipalIntoDB,
  getAllWebsitePrincipalsFromDB,
  getWebsitePrincipalByIdFromDB,
  updateWebsitePrincipalFromDB,
  deleteWebsitePrincipalFromDB,
};
