import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  IWebsiteGoverningBodyMemberCreate,
  IWebsiteGoverningBodyMemberUpdate,
} from './websiteGoverningBody.type';

const createWebsiteGoverningBodyMemberIntoDB = async (
  payload: IWebsiteGoverningBodyMemberCreate,
) => {
  const result = await prisma.websiteGoverningBodyMember.create({
    data: payload,
  });

  return result;
};

const getAllWebsiteGoverningBodyMembersFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['name', 'designation'],
  });

  const [totalItems, members] = await prisma.$transaction([
    prisma.websiteGoverningBodyMember.count({ where }),
    prisma.websiteGoverningBodyMember.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: members,
  };
};

const getWebsiteGoverningBodyMemberByIdFromDB = async (id: string) => {
  const result = await prisma.websiteGoverningBodyMember.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateWebsiteGoverningBodyMemberFromDB = async (
  id: string,
  payload: IWebsiteGoverningBodyMemberUpdate,
) => {
  const existing = await prisma.websiteGoverningBodyMember.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website governing body member not found');
  }

  const result = await prisma.websiteGoverningBodyMember.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteWebsiteGoverningBodyMemberFromDB = async (id: string) => {
  const existing = await prisma.websiteGoverningBodyMember.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(404, 'Website governing body member not found');
  }

  await prisma.websiteGoverningBodyMember.delete({
    where: { id },
  });
};

export const WebsiteGoverningBodyService = {
  createWebsiteGoverningBodyMemberIntoDB,
  getAllWebsiteGoverningBodyMembersFromDB,
  getWebsiteGoverningBodyMemberByIdFromDB,
  updateWebsiteGoverningBodyMemberFromDB,
  deleteWebsiteGoverningBodyMemberFromDB,
};
