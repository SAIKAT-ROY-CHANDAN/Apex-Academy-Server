import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError'; // adjust path to match your project
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CreateTeacherAttendanceInput,
  UpdateTeacherAttendanceInput,
} from './teacherAttendance.type';
import { Prisma } from '../../../../generated/prisma/client';

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const createTeacherAttendanceIntoDB = async (
  payload: CreateTeacherAttendanceInput,
) => {
  const checkInDate = new Date(payload.check_in_time);
  const attendanceDate = new Date(checkInDate);
  attendanceDate.setHours(0, 0, 0, 0);

  const response = await prisma.teacherAttendance.create({
    data: {
      teacher_id: payload.teacher_id,
      attendance_status: payload.attendance_status,
      attendance_date: attendanceDate,
      check_in_time: checkInDate,
      check_out_time: payload.check_out_time
        ? new Date(payload.check_out_time)
        : null,
    },
    include: {
      teacher: { select: { id: true, full_name: true, phone: true } },
    },
  });

  return response;
};

const getAllTeacherAttendancesFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, attendances] = await prisma.$transaction([
    prisma.teacherAttendance.count({ where }),
    prisma.teacherAttendance.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        teacher: { select: { id: true, full_name: true, phone: true } },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: attendances,
  };
};

const getTeacherAttendanceHistoryFromDB = async (teacher_id: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacher_id },
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      photo: true,
      gender: true,
      teacher_type: true,
      administrative_position: true,
      is_active: true,
      designation: { select: { id: true, name: true } },
      department: { select: { id: true, department_name: true } },
      shift: { select: { id: true, name: true, start_time: true, end_time: true } },
    },
  });

  if (!teacher) {
    throw new AppError(404, 'Teacher not found');
  }

  const records = await prisma.teacherAttendance.findMany({
    where: { teacher_id },
    orderBy: { attendance_date: 'desc' },
    select: {
      id: true,
      attendance_date: true,
      attendance_status: true,
      check_in_time: true,
      check_out_time: true,
      created_at: true,
    },
  });

  const present = records.filter((r) => r.attendance_status === 'PRESENT').length;
  const absent = records.filter((r) => r.attendance_status === 'ABSENT').length;
  const totalDays = records.length;
  const attendancePercentage =
    totalDays > 0 ? Number(((present / totalDays) * 100).toFixed(2)) : 0;

  return {
    teacher,
    summary: {
      totalDays,
      present,
      absent,
      attendancePercentage,
    },
    data: records,
  };
};

const isTodayCheckInExists = async (teacher_id: string) => {
  const today = getStartOfToday();

  const attendance = await prisma.teacherAttendance.findUnique({
    where: {
      teacher_id_attendance_date: {
        teacher_id,
        attendance_date: today,
      },
    },
  });

  return {
    isCheckIn: attendance !== null,
    id: attendance?.id,
  };
};

const isTodayCheckOutExists = async (teacher_id: string) => {
  const today = getStartOfToday();

  const attendance = await prisma.teacherAttendance.findUnique({
    where: {
      teacher_id_attendance_date: {
        teacher_id,
        attendance_date: today,
      },
    },
    select: { check_out_time: true },
  });

  return !!attendance?.check_out_time;
};

const getTodayAttendanceStatusForTeachers = async (teacherIds: string[]) => {
  const today = getStartOfToday();

  const records = await prisma.teacherAttendance.findMany({
    where: {
      teacher_id: { in: teacherIds },
      attendance_date: today,
    },
    select: { id: true, teacher_id: true, check_out_time: true },
  });

  const statusMap: Record<
    string,
    { isCheckIn: boolean; checkInId?: string; isCheckOut: boolean }
  > = {};

  for (const teacherId of teacherIds) {
    const record = records.find((r) => r.teacher_id === teacherId);
    statusMap[teacherId] = {
      isCheckIn: !!record,
      checkInId: record?.id,
      isCheckOut: !!record?.check_out_time,
    };
  }

  return statusMap;
};

const getTeacherAttendanceByIdFromDB = async (id: string) => {
  return prisma.teacherAttendance.findUnique({
    where: { id },
    include: {
      teacher: { select: { id: true, full_name: true, phone: true } },
    },
  });
};

const updateTeacherAttendanceByIdIntoDB = async (
  id: string,
  payload: UpdateTeacherAttendanceInput,
) => {
  try {
    return await prisma.teacherAttendance.update({
      where: { id },
      data: {
        ...(payload.attendance_status && {
          attendance_status: payload.attendance_status,
        }),
        ...(payload.check_in_time && {
          check_in_time: new Date(payload.check_in_time),
        }),
        ...(payload.check_out_time && {
          check_out_time: new Date(payload.check_out_time),
        }),
      },
      include: {
        teacher: { select: { id: true, full_name: true, phone: true } },
      },
    });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new AppError(404, 'Attendance record not found');
    }
    throw error;
  }
};

const deleteTeacherAttendanceByIdFromDB = async (id: string) => {
  try {
    return await prisma.teacherAttendance.delete({ where: { id } });
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      throw new AppError(404, 'Attendance record not found');
    }
    throw error;
  }
};

const getTeacherAttendanceReportFromDB = async (query: {
  teacher_id?: string;
  teacher_type?: string;
  designation_id?: string;
  department_id?: string;
  administrative_position?: string;
  start_date?: string;
  end_date?: string;
}) => {
  const where: Record<string, any> = {};

  if (query.teacher_id) {
    where.teacher_id = query.teacher_id;
  }

  if (
    query.teacher_type ||
    query.designation_id ||
    query.department_id ||
    query.administrative_position
  ) {
    const teacherFilter: Record<string, string> = {};
    if (query.teacher_type) {
      teacherFilter.teacher_type = query.teacher_type;
    }
    if (query.designation_id) {
      teacherFilter.designation_id = query.designation_id;
    }
    if (query.department_id) {
      teacherFilter.department_id = query.department_id;
    }
    if (query.administrative_position) {
      teacherFilter.administrative_position = query.administrative_position;
    }
    where.teacher = teacherFilter;
  }

  if (query.start_date || query.end_date) {
    const dateFilter: Record<string, Date> = {};
    if (query.start_date) {
      dateFilter.gte = new Date(`${query.start_date}T00:00:00.000Z`);
    }
    if (query.end_date) {
      dateFilter.lte = new Date(`${query.end_date}T23:59:59.999Z`);
    }
    where.attendance_date = dateFilter;
  }

  const records = await prisma.teacherAttendance.findMany({
    where,
    select: {
      teacher_id: true,
      attendance_status: true,
      attendance_date: true,
      check_in_time: true,
      check_out_time: true,
      teacher: {
        select: { id: true, full_name: true, phone: true },
      },
    },
    orderBy: { attendance_date: 'desc' },
  });

  // ── Overtime summary per teacher for the same date range ──
  const overtimeDateFilter: Record<string, Date> = {};
  if (query.start_date) {
    overtimeDateFilter.gte = new Date(`${query.start_date}T00:00:00.000Z`);
  }
  if (query.end_date) {
    overtimeDateFilter.lte = new Date(`${query.end_date}T23:59:59.999Z`);
  }

  const teacherIdsInReport = Array.from(
    new Set(records.map((r) => r.teacher_id)),
  );

  const [overtimeRecords, overtimeConfigs] = await Promise.all([
    teacherIdsInReport.length > 0
      ? prisma.teacherOvertime.findMany({
          where: {
            teacher_id: { in: teacherIdsInReport },
            end_time: { not: null },
            ...(Object.keys(overtimeDateFilter).length > 0
              ? { start_time: overtimeDateFilter }
              : {}),
          },
          select: { teacher_id: true, overtime_hours: true },
        })
      : [],
    teacherIdsInReport.length > 0
      ? prisma.overtimeTeacherConfig.findMany({
          where: { teacher_id: { in: teacherIdsInReport } },
          select: { teacher_id: true, overtime_hourly_amount: true },
        })
      : [],
  ]);

  const overtimeHoursMap = new Map<string, number>();
  for (const ot of overtimeRecords) {
    overtimeHoursMap.set(
      ot.teacher_id,
      (overtimeHoursMap.get(ot.teacher_id) ?? 0) + ot.overtime_hours,
    );
  }
  const hourlyRateMap = new Map(
    overtimeConfigs.map((c) => [c.teacher_id, c.overtime_hourly_amount]),
  );

  const grouped = new Map<
    string,
    {
      teacher_id: string;
      teacher_name: string;
      phone: string;
      total_days: number;
      present: number;
      absent: number;
      attendance_percentage: number;
      overtime_hours: number;
      overtime_hourly_rate: number;
      overtime_amount: number;
      records: {
        attendance_date: string;
        attendance_status: string;
        check_in_time: string;
        check_out_time: string | null;
      }[];
    }
  >();

  for (const record of records) {
    const key = record.teacher_id;
    if (!grouped.has(key)) {
      const hours = Number(
        (overtimeHoursMap.get(key) ?? 0).toFixed(2),
      );
      const rate = hourlyRateMap.get(key) ?? 0;
      grouped.set(key, {
        teacher_id: record.teacher_id,
        teacher_name: record.teacher.full_name,
        phone: record.teacher.phone,
        total_days: 0,
        present: 0,
        absent: 0,
        attendance_percentage: 0,
        overtime_hours: hours,
        overtime_hourly_rate: rate,
        overtime_amount: Number((hours * rate).toFixed(2)),
        records: [],
      });
    }

    const entry = grouped.get(key)!;
    entry.total_days += 1;
    if (record.attendance_status === 'PRESENT') {
      entry.present += 1;
    } else {
      entry.absent += 1;
    }
    entry.records.push({
      attendance_date: record.attendance_date.toISOString(),
      attendance_status: record.attendance_status,
      check_in_time: record.check_in_time.toISOString(),
      check_out_time: record.check_out_time?.toISOString() ?? null,
    });
  }

  const data = Array.from(grouped.values()).map((entry) => ({
    ...entry,
    attendance_percentage:
      entry.total_days > 0
        ? Math.round((entry.present / entry.total_days) * 100)
        : 0,
  }));

  const totalOvertimeHours = Number(
    data.reduce((sum, e) => sum + e.overtime_hours, 0).toFixed(2),
  );
  const totalOvertimeAmount = Number(
    data.reduce((sum, e) => sum + e.overtime_amount, 0).toFixed(2),
  );

  return {
    data,
    meta: {
      totalTeachers: data.length,
      totalRecords: records.length,
      totalOvertimeHours,
      totalOvertimeAmount,
    },
  };
};

export const TeacherAttendanceService = {
  createTeacherAttendanceIntoDB,
  getAllTeacherAttendancesFromDB,
  getTeacherAttendanceByIdFromDB,
  updateTeacherAttendanceByIdIntoDB,
  isTodayCheckInExists,
  isTodayCheckOutExists,
  getTodayAttendanceStatusForTeachers,
  deleteTeacherAttendanceByIdFromDB,
  getTeacherAttendanceReportFromDB,
  getTeacherAttendanceHistoryFromDB,
};
