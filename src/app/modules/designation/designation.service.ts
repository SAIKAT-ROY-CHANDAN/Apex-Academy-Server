import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CreateDesignationInput,
  UpdateDesignationInput,
} from './designation.type';

const createDesignationIntoDB = async (payload: CreateDesignationInput) => {
  const response = await prisma.designation.create({
    data: {
      name: payload.name,
    },
  });

  return response;
};

const getAllDesignationFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['name'],
  });

  const [totalItems, designations] = await prisma.$transaction([
    prisma.designation.count({ where }),
    prisma.designation.findMany({
      where,
      orderBy,
      skip,
      take,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: designations,
  };
};

const getDesignationByIdFromDB = async (id: string) => {
  const response = await prisma.designation.findUnique({
    where: {
      id,
    },
  });

  return response;
};

const updateDesignationByIdIntoDB = async (
  id: string,
  payload: UpdateDesignationInput,
) => {
  const response = await prisma.designation.update({
    where: { id },
    data: {
      ...(payload.name && { name: payload.name }),
    },
  });

  return response;
};

const deleteDesignationByIdFromDB = async (id: string) => {
  const response = await prisma.designation.delete({
    where: {
      id,
    },
  });

  return response;
};

export const DesignationService = {
  createDesignationIntoDB,
  getAllDesignationFromDB,
  getDesignationByIdFromDB,
  updateDesignationByIdIntoDB,
  deleteDesignationByIdFromDB,
};
