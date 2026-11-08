import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CreateTeacherOvertimeInput,
  EndTeacherOvertimeInput,
  UpdateTeacherOvertimeInput,
} from './teacherOvertime.type';

const getDayRange = (ref: Date = new Date()) => {
  const dayStart = new Date(
    ref.getFullYear(),
    ref.getMonth(),
    ref.getDate(),
  );
  const dayEnd = new Date(dayStart.getTime() + 86400000);
  return { dayStart, dayEnd };
};

const calcHours = (start: Date, end: Date) => {
  const ms = end.getTime() - start.getTime();
  if (ms <= 0) throw new AppError(400, 'End time must be after start time');
  return Number((ms / (1000 * 60 * 60)).toFixed(2));
};

// ── Start overtime (no shift dependency, one record per day) ──
const startTeacherOvertimeIntoDB = async (
  payload: CreateTeacherOvertimeInput,
) => {
  const [existingConfig, existingTeacher] = await Promise.all([
    prisma.overtimeTeacherConfig.findUnique({
      where: { teacher_id: payload.teacher_id },
    }),
    prisma.teacher.findUnique({ where: { id: payload.teacher_id } }),
  ]);

  if (!existingConfig)
    throw new AppError(404, 'Overtime configuration not found');
  if (!existingTeacher) throw new AppError(404, 'Teacher not found');

  const startTime = payload.start_time
    ? new Date(payload.start_time)
    : new Date();
  if (isNaN(startTime.getTime()))
    throw new AppError(400, 'Invalid start time');

  const { dayStart, dayEnd } = getDayRange(startTime);

  const existingToday = await prisma.teacherOvertime.findFirst({
    where: {
      teacher_id: payload.teacher_id,
      OR: [
        { start_time: { gte: dayStart, lt: dayEnd } },
        { created_at: { gte: dayStart, lt: dayEnd } },
      ],
    },
    orderBy: { created_at: 'desc' },
  });

  if (existingToday) {
    if (!existingToday.end_time)
      throw new AppError(400, 'Overtime already started for this teacher today');
    throw new AppError(400, 'Overtime already recorded for this teacher today');
  }

  const response = await prisma.teacherOvertime.create({
    data: {
      teacher_id: payload.teacher_id,
      overtime_id: existingConfig.id,
      start_time: startTime,
      end_time: null,
      overtime_hours: 0,
    },
  });

  return response;
};

// Backwards-compatible alias: old single-shot POST now acts as "start"
const createTeacherOvertimeIntoDB = async (
  payload: CreateTeacherOvertimeInput,
) => {
  // Accept legacy { overtime_at } payloads at runtime
  const legacyAt = (payload as unknown as { overtime_at?: string | Date })
    .overtime_at;
  return startTeacherOvertimeIntoDB({
    teacher_id: payload.teacher_id,
    start_time: payload.start_time ?? legacyAt,
  });
};

// ── End overtime: hours = end - start ──
const endTeacherOvertimeIntoDB = async (payload: EndTeacherOvertimeInput) => {
  const endTime = payload.end_time ? new Date(payload.end_time) : new Date();
  if (isNaN(endTime.getTime())) throw new AppError(400, 'Invalid end time');

  let record;

  if (payload.overtime_id) {
    const byId = await prisma.teacherOvertime.findUnique({
      where: { id: payload.overtime_id },
    });
    if (byId && byId.teacher_id === payload.teacher_id) record = byId;
  }

  if (!record) {
    // Find today's open record for the teacher
    const { dayStart, dayEnd } = getDayRange(endTime);
    record = await prisma.teacherOvertime.findFirst({
      where: {
        teacher_id: payload.teacher_id,
        end_time: null,
        OR: [
          { start_time: { gte: dayStart, lt: dayEnd } },
          { created_at: { gte: dayStart, lt: dayEnd } },
        ],
      },
      orderBy: { created_at: 'desc' },
    });
    // Fallback: any open record (e.g. started yesterday, ending today)
    if (!record) {
      record = await prisma.teacherOvertime.findFirst({
        where: { teacher_id: payload.teacher_id, end_time: null },
        orderBy: { created_at: 'desc' },
      });
    }
    if (!record) throw new AppError(404, 'No running overtime found');
    if (record.end_time)
      throw new AppError(400, 'Overtime already ended');
  }

  if (record.end_time) throw new AppError(400, 'Overtime already ended');

  const hours = calcHours(new Date(record.start_time), endTime);

  const response = await prisma.teacherOvertime.update({
    where: { id: record.id },
    data: { end_time: endTime, overtime_hours: hours },
  });

  return response;
};

const getTodayOvertimeStatusForTeachers = async (teacherIds: string[]) => {
  const { dayStart, dayEnd } = getDayRange(new Date());

  const records = await prisma.teacherOvertime.findMany({
    where: {
      teacher_id: { in: teacherIds },
      OR: [
        { start_time: { gte: dayStart, lt: dayEnd } },
        { created_at: { gte: dayStart, lt: dayEnd } },
      ],
    },
    select: {
      id: true,
      teacher_id: true,
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

  for (const teacherId of teacherIds) {
    const record = records.find((r) => r.teacher_id === teacherId);
    statusMap[teacherId] = {
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

const getAllTeacherOvertimesFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, overtimes] = await prisma.$transaction([
    prisma.teacherOvertime.count({ where }),
    prisma.teacherOvertime.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        teacher: {
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

const getTeacherOvertimeByIdFromDB = async (id: string) => {
  const response = await prisma.teacherOvertime.findUnique({
    where: { id },
    include: {
      teacher: {
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

const updateTeacherOvertimeByIdIntoDB = async (
  id: string,
  payload: UpdateTeacherOvertimeInput,
) => {
  const existing = await prisma.teacherOvertime.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Overtime record not found');

  let overtimeHours = payload.overtime_hours;
  let endTime = payload.end_time ? new Date(payload.end_time) : undefined;
  let startTime = payload.start_time ? new Date(payload.start_time) : undefined;

  if (startTime && isNaN(startTime.getTime()))
    throw new AppError(400, 'Invalid start time');
  if (endTime && isNaN(endTime.getTime()))
    throw new AppError(400, 'Invalid end time');

  // Auto-recalculate when start/end changes and hours not explicitly given
  const finalStart = startTime ?? new Date(existing.start_time);
  const finalEnd = endTime ?? (existing.end_time ? new Date(existing.end_time) : null);
  if (overtimeHours === undefined && finalEnd) {
    overtimeHours = calcHours(finalStart, finalEnd);
  }

  const response = await prisma.teacherOvertime.update({
    where: { id },
    data: {
      ...(startTime && { start_time: startTime }),
      ...(endTime && { end_time: endTime }),
      ...(overtimeHours !== undefined && { overtime_hours: overtimeHours }),
    },
    include: {
      teacher: {
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

const deleteTeacherOvertimeByIdFromDB = async (id: string) => {
  const response = await prisma.teacherOvertime.delete({
    where: { id },
  });

  return response;
};

interface CalculateTeacherOvertimePayload {
  teacherId: string;
  month: number;
  year: number;
}

export const calculateTeacherOvertime = async ({
  teacherId,
  month,
  year,
}: CalculateTeacherOvertimePayload) => {
  // Step 1
  // Find teacher overtime configuration

  const overtimeConfig = await prisma.overtimeTeacherConfig.findUnique({
    where: {
      teacher_id: teacherId,
    },
  });

  if (!overtimeConfig) {
    return {
      hours: 0,
      amount: 0,
    };
  }

  // Step 2
  // Get all completed overtime records for this payroll month
  // (running records have 0 hours so they contribute nothing)

  const overtimes = await prisma.teacherOvertime.findMany({
    where: {
      teacher_id: teacherId,
      end_time: { not: null },
      start_time: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
    },
  });

  // Step 3
  // Sum total hours

  const totalHours = overtimes.reduce(
    (sum, overtime) => sum + overtime.overtime_hours,
    0,
  );

  // Step 4
  // Calculate amount

  const totalAmount = totalHours * overtimeConfig.overtime_hourly_amount;

  return {
    hours: totalHours,
    amount: totalAmount,
  };
};

export const TeacherOvertimeService = {
  createTeacherOvertimeIntoDB,
  startTeacherOvertimeIntoDB,
  endTeacherOvertimeIntoDB,
  getTodayOvertimeStatusForTeachers,
  getAllTeacherOvertimesFromDB,
  getTeacherOvertimeByIdFromDB,
  updateTeacherOvertimeByIdIntoDB,
  deleteTeacherOvertimeByIdFromDB,
};
