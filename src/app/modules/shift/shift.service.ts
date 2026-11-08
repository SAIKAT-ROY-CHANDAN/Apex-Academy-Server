import { Prisma } from '../../../../generated/prisma/client';
import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';

const createShiftIntoDB = async (payload: Prisma.ShiftCreateInput) => {
  return await prisma.shift.create({
    data: payload,
  });
};

const getAllShiftsFromDB = async (query: QueryParams) => {
  const { orderBy, page, skip, take, where } = buildPrismaQuery(query, {
    searchFields: ['shift_name'],
  });

  const [totalItems, shifts] = await prisma.$transaction([
    prisma.shift.count({ where }),
    prisma.shift.findMany({
      skip,
      take,
      orderBy,
      where,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: shifts,
  };
};

const getShiftByIdFromDB = async (shiftId: string) => {
  const existingShift = await prisma.shift.findUnique({
    where: {
      id: shiftId,
    },
  });

  if (!existingShift) {
    throw new Error('Shift not found');
  }

  return existingShift;
};

const updateShiftIntoDB = async (
  shiftId: string,
  payload: Prisma.ShiftUpdateInput,
) => {
  const existingShift = await prisma.shift.findUnique({
    where: {
      id: shiftId,
    },
  });

  if (!existingShift) {
    throw new Error('Shift not found');
  }

  const updatedShift = await prisma.shift.update({
    where: {
      id: shiftId,
    },
    data: payload,
  });

  return updatedShift;
};

const deleteShiftFromDB = async (shiftId: string) => {
  const existingShift = await prisma.shift.findUnique({
    where: {
      id: shiftId,
    },
  });
  if (!existingShift) {
    throw new Error('Shift not found');
  }

  const response = await prisma.shift.delete({
    where: {
      id: shiftId,
    },
  });
  return response;
};

export const ShiftService = {
  createShiftIntoDB,
  getAllShiftsFromDB,
  getShiftByIdFromDB,
  updateShiftIntoDB,
  deleteShiftFromDB,
};
