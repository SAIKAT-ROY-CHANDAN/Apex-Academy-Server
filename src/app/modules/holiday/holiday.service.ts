import prisma from '../../../db/db.config';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IHolidayCreate, IHolidayUpdate } from './holiday.type';

const createHolidayIntoDB = async (payload: IHolidayCreate) => {
  console.log('Creating holiday with payload:', payload);
  const newHoliday = await prisma.holiday.create({
    data: payload,
  });

  return newHoliday;
};

const getAllHolidaysFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['title'],
  });

  const [totalItems, holidays] = await prisma.$transaction([
    prisma.holiday.count({ where }),
    prisma.holiday.findMany({
      skip,
      take,
      orderBy,
      where,
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: holidays,
  };
};

const getCalendarHolidaysFromDB = async (year?: number) => {
  const where: Record<string, unknown> = { is_active: true };

  if (year && !Number.isNaN(year)) {
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

    where.AND = [
      { start_date: { lte: yearEnd } },
      {
        OR: [
          { end_date: { gte: yearStart } },
          { AND: [{ end_date: null }, { start_date: { gte: yearStart } }] },
        ],
      },
    ];
  }

  return prisma.holiday.findMany({
    where,
    orderBy: { start_date: 'asc' },
  });
};

const getHolidayByIdFromDB = async (holidayId: string) => {
  const existingHoliday = await prisma.holiday.findUnique({
    where: {
      id: holidayId,
    },
  });

  if (!existingHoliday) {
    throw new Error('Holiday not found');
  }

  return existingHoliday;
};

const updateHolidayFromDB = async (
  holidayId: string,
  payload: IHolidayUpdate,
) => {
  const existingHoliday = await prisma.holiday.findUnique({
    where: {
      id: holidayId,
    },
  });

  if (!existingHoliday) {
    throw new Error('Holiday not found');
  }

  const updatedHoliday = await prisma.holiday.update({
    where: {
      id: holidayId,
    },
    data: payload,
  });

  return updatedHoliday;
};

const deleteHolidayFromDB = async (holidayId: string) => {
  const existingHoliday = await prisma.holiday.findUnique({
    where: {
      id: holidayId,
    },
  });

  if (!existingHoliday) {
    throw new Error('Holiday not found');
  }

  await prisma.holiday.delete({
    where: {
      id: holidayId,
    },
  });
};

export const HolidayService = {
  createHolidayIntoDB,
  getAllHolidaysFromDB,
  getCalendarHolidaysFromDB,
  getHolidayByIdFromDB,
  updateHolidayFromDB,
  deleteHolidayFromDB,
};