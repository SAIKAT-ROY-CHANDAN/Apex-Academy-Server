import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CreateStaffResignationInput,
  UpdateStaffResignationInput,
} from './staffResignation.type';

const createStaffResignationIntoDB = async (
  payload: CreateStaffResignationInput,
) => {
  const response = await prisma.staffResignation.create({
    data: {
      staff_id: payload.staff_id,
      reason: payload.reason,
      resignation_date: new Date(payload.resignation_date),
    },
    include: {
      staff: {
        select: {
          id: true,
          full_name: true,
          phone: true,
          email: true,
          gender: true,
          staff_type: true,
          photo: true,
          designation: { select: { id: true, name: true } },
        },
      },
    },
  });

  return response;
};

const getAllStaffResignationsFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['reason'],
  });

  const [totalItems, resignations] = await prisma.$transaction([
    prisma.staffResignation.count({ where }),
    prisma.staffResignation.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        staff: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            email: true,
            gender: true,
            staff_type: true,
            photo: true,
            designation: { select: { id: true, name: true } },
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: resignations,
  };
};

const getStaffResignationByIdFromDB = async (id: string) => {
  const response = await prisma.staffResignation.findUnique({
    where: { id },
    include: {
      staff: {
        select: {
          id: true,
          full_name: true,
          phone: true,
          email: true,
          gender: true,
          staff_type: true,
          photo: true,
          designation: { select: { id: true, name: true } },
        },
      },
    },
  });

  return response;
};

const updateStaffResignationByIdIntoDB = async (
  id: string,
  payload: UpdateStaffResignationInput,
) => {
  const response = await prisma.staffResignation.update({
    where: { id },
    data: {
      ...(payload.reason && { reason: payload.reason }),
      ...(payload.resignation_date && {
        resignation_date: new Date(payload.resignation_date),
      }),
    },
    include: {
      staff: {
        select: {
          id: true,
          full_name: true,
          phone: true,
          email: true,
          gender: true,
          staff_type: true,
          photo: true,
          designation: { select: { id: true, name: true } },
        },
      },
    },
  });

  return response;
};

const deleteStaffResignationByIdFromDB = async (id: string) => {
  const response = await prisma.staffResignation.delete({
    where: { id },
  });

  return response;
};

export const StaffResignationService = {
  createStaffResignationIntoDB,
  getAllStaffResignationsFromDB,
  getStaffResignationByIdFromDB,
  updateStaffResignationByIdIntoDB,
  deleteStaffResignationByIdFromDB,
};
