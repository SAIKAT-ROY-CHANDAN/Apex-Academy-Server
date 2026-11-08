import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CreateStaffOvertimeInput,
  EndStaffOvertimeInput,
  UpdateStaffOvertimeInput,
} from './staffOvertime.type';

interface CalculateStaffOvertimePayload {
  staffId: string;
  month: number;
  year: number;
}

const getDayRange = (ref: Date = new Date()) => {
  const dayStart = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const dayEnd = new Date(dayStart.getTime() + 86400000);
  return { dayStart, dayEnd };
};

const calcHours = (start: Date, end: Date) => {
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) throw new AppError(400, 'End time must be after start time');
  return Number((ms / (1000 * 60 * 60)).toFixed(2));
};

// ── Start overtime (one record per day) ──
const startStaffOvertimeIntoDB = async (payload: CreateStaffOvertimeInput) => {
  let overtimeConfig = payload.overtime_id
    ? await prisma.overtimeStaffConfig.findUnique({
        where: { id: payload.overtime_id },
      })
    : await prisma.overtimeStaffConfig.findFirst({
        where: { staff_id: payload.staff_id },
      });

  const existingStaff = await prisma.staff.findUnique({
    where: { id: payload.staff_id },
  });

  if (!overtimeConfig)
    throw new AppError(404, 'Overtime configuration not found for this staff');
  if (!existingStaff) throw new AppError(404, 'Staff not found');

  const startTime = payload.start_time
    ? new Date(payload.start_time)
    : new Date();
  if (isNaN(startTime.getTime()))
    throw new AppError(400, 'Invalid start time');

  const { dayStart, dayEnd } = getDayRange(startTime);

  const existingToday = await prisma.staffOvertime.findFirst({
    where: {
      staff_id: payload.staff_id,
      OR: [
        { start_time: { gte: dayStart, lt: dayEnd } },
        { created_at: { gte: dayStart, lt: dayEnd } },
      ],
    },
    orderBy: { created_at: 'desc' },
  });

  if (existingToday) {
    if (!existingToday.end_time)
      throw new AppError(400, 'Overtime already started for this staff today');
    throw new AppError(400, 'Overtime already recorded for this staff today');
  }

  const response = await prisma.staffOvertime.create({
    data: {
      staff_id: payload.staff_id,
      overtime_id: overtimeConfig.id,
      start_time: startTime,
      end_time: null,
      overtime_hours: 0,
    },
    include: {
      staff: { select: { id: true, full_name: true, phone: true } },
      overtime: { select: { id: true, overtime_hourly_amount: true } },
    },
  });

  return response;
};

// Legacy single-shot create: treat explicit hours as before, otherwise start
const createStaffOvertimeIntoDB = async (payload: CreateStaffOvertimeInput & { overtime_hours?: number }) => {
  if (payload.overtime_hours !== undefined) {
    let overtimeConfig = payload.overtime_id
      ? await prisma.overtimeStaffConfig.findUnique({
          where: { id: payload.overtime_id },
        })
      : await prisma.overtimeStaffConfig.findFirst({
          where: { staff_id: payload.staff_id },
        });
    if (!overtimeConfig)
      throw new AppError(
        404,
        'Overtime configuration not found for this staff',
      );
    const response = await prisma.staffOvertime.create({
      data: {
        staff_id: payload.staff_id,
        overtime_id: overtimeConfig.id,
        start_time: payload.start_time ? new Date(payload.start_time) : new Date(),
        overtime_hours: payload.overtime_hours,
      },
      include: {
        staff: { select: { id: true, full_name: true, phone: true } },
        overtime: { select: { id: true, overtime_hourly_amount: true } },
      },
    });
    return response;
  }
  return startStaffOvertimeIntoDB(payload);
};

// Legacy GET /staff/:staffId endpoint — now starts today's overtime
const createStaffOvertimeByStaffIdFromDB = async (staffId: string) => {
  return startStaffOvertimeIntoDB({ staff_id: staffId });
};

// ── End overtime: hours = end - start ──
const endStaffOvertimeIntoDB = async (payload: EndStaffOvertimeInput) => {
  const endTime = payload.end_time ? new Date(payload.end_time) : new Date();
  if (isNaN(endTime.getTime())) throw new AppError(400, 'Invalid end time');

  let record;

  if (payload.overtime_id) {
    // overtime_id here carries the overtime *record* id from today-status
    const byId = await prisma.staffOvertime.findUnique({
      where: { id: payload.overtime_id },
    });
    if (byId && byId.staff_id === payload.staff_id) record = byId;
  }

  if (!record) {
    const { dayStart, dayEnd } = getDayRange(endTime);
    record = await prisma.staffOvertime.findFirst({
      where: {
        staff_id: payload.staff_id,
        end_time: null,
        OR: [
          { start_time: { gte: dayStart, lt: dayEnd } },
          { created_at: { gte: dayStart, lt: dayEnd } },
        ],
      },
      orderBy: { created_at: 'desc' },
    });
    if (!record) {
      record = await prisma.staffOvertime.findFirst({
        where: { staff_id: payload.staff_id, end_time: null },
        orderBy: { created_at: 'desc' },
      });
    }
    if (!record) throw new AppError(404, 'No running overtime found');
  }

  if (record.end_time) throw new AppError(400, 'Overtime already ended');

  const hours = calcHours(new Date(record.start_time), endTime);

  const response = await prisma.staffOvertime.update({
    where: { id: record.id },
    data: { end_time: endTime, overtime_hours: hours },
    include: {
      staff: { select: { id: true, full_name: true, phone: true } },
      overtime: { select: { id: true, overtime_hourly_amount: true } },
    },
  });

  return response;
};

const getTodayOvertimeStatusForStaff = async (staffIds: string[]) => {
  const { dayStart, dayEnd } = getDayRange(new Date());

  const records = await prisma.staffOvertime.findMany({
    where: {
      staff_id: { in: staffIds },
      OR: [
        { start_time: { gte: dayStart, lt: dayEnd } },
        { created_at: { gte: dayStart, lt: dayEnd } },
      ],
    },
    select: {
      id: true,
      staff_id: true,
      start_time: true,
      end_time: true,
      overtime_hours: true,
    },
  });

  const statusMap: Record<
    string,
    {
      hasOvertime: boolean;
      isRunning: boolean;
      overtimeId?: string;
      startTime?: string;
      endTime?: string | null;
      hours: number;
    }
  > = {};

  for (const staffId of staffIds) {
    const record = records.find((r) => r.staff_id === staffId);
    statusMap[staffId] = {
      hasOvertime: !!record,
      isRunning: !!record && !record.end_time,
      overtimeId: record?.id,
      startTime: record?.start_time?.toISOString(),
      endTime: record?.end_time?.toISOString() ?? null,
      hours: record?.overtime_hours ?? 0,
    };
  }

  return statusMap;
};

const getAllStaffOvertimesFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, overtimes] = await prisma.$transaction([
    prisma.staffOvertime.count({ where }),
    prisma.staffOvertime.findMany({
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
          },
        },
        overtime: {
          select: {
            id: true,
            overtime_hourly_amount: true,
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: overtimes,
  };
};

const getStaffOvertimeByIdFromDB = async (id: string) => {
  const response = await prisma.staffOvertime.findUnique({
    where: { id },
    include: {
      staff: {
        select: {
          id: true,
          full_name: true,
          phone: true,
        },
      },
      overtime: {
        select: {
          id: true,
          overtime_hourly_amount: true,
        },
      },
    },
  });

  return response;
};

const updateStaffOvertimeByIdIntoDB = async (
  id: string,
  payload: UpdateStaffOvertimeInput,
) => {
  const existing = await prisma.staffOvertime.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Overtime record not found');

  let overtimeHours = payload.overtime_hours;
  const startTime = payload.start_time ? new Date(payload.start_time) : undefined;
  const endTime = payload.end_time ? new Date(payload.end_time) : undefined;

  if (startTime && isNaN(startTime.getTime()))
    throw new AppError(400, 'Invalid start time');
  if (endTime && isNaN(endTime.getTime()))
    throw new AppError(400, 'Invalid end time');

  const finalStart = startTime ?? new Date(existing.start_time);
  const finalEnd = endTime ?? (existing.end_time ? new Date(existing.end_time) : null);
  if (overtimeHours === undefined && finalEnd) {
    overtimeHours = calcHours(finalStart, finalEnd);
  }

  const response = await prisma.staffOvertime.update({
    where: { id },
    data: {
      ...(payload.overtime_id && { overtime_id: payload.overtime_id }),
      ...(startTime && { start_time: startTime }),
      ...(endTime && { end_time: endTime }),
      ...(overtimeHours !== undefined && {
        overtime_hours: overtimeHours,
      }),
    },
    include: {
      staff: {
        select: {
          id: true,
          full_name: true,
          phone: true,
        },
      },
      overtime: {
        select: {
          id: true,
          overtime_hourly_amount: true,
        },
      },
    },
  });

  return response;
};

const deleteStaffOvertimeByIdFromDB = async (id: string) => {
  const response = await prisma.staffOvertime.delete({
    where: { id },
  });

  return response;
};

export const calculateStaffOvertime = async ({
  staffId,
  month,
  year,
}: CalculateStaffOvertimePayload) => {
  const overtimeConfig = await prisma.overtimeStaffConfig.findFirst({
    where: {
      staff_id: staffId,
    },
  });

  if (!overtimeConfig) {
    return {
      hours: 0,
      amount: 0,
    };
  }

  const overtimes = await prisma.staffOvertime.findMany({
    where: {
      staff_id: staffId,
      end_time: { not: null },
      start_time: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
  });

  const totalHours = overtimes.reduce(
    (sum, overtime) => sum + overtime.overtime_hours,
    0,
  );

  const totalAmount = totalHours * overtimeConfig.overtime_hourly_amount;

  return {
    hours: totalHours,
    amount: totalAmount,
  };
};

export const StaffOvertimeService = {
  createStaffOvertimeIntoDB,
  createStaffOvertimeByStaffIdFromDB,
  startStaffOvertimeIntoDB,
  endStaffOvertimeIntoDB,
  getTodayOvertimeStatusForStaff,
  getAllStaffOvertimesFromDB,
  getStaffOvertimeByIdFromDB,
  updateStaffOvertimeByIdIntoDB,
  deleteStaffOvertimeByIdFromDB,
};
