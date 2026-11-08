import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CreateStaffAttendanceInput,
  UpdateStaffAttendanceInput,
} from './staffAttendance.type';
import { Prisma } from '../../../../generated/prisma/client';

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const createStaffAttendanceIntoDB = async (
  payload: CreateStaffAttendanceInput,
) => {
  const checkInDate = new Date(payload.check_in_time);
  const attendanceDate = new Date(checkInDate);
  attendanceDate.setHours(0, 0, 0, 0);

  const response = await prisma.staffAttendance.create({
    data: {
      staff_id: payload.staff_id,
      attendance_status: payload.attendance_status,
      attendance_date: attendanceDate,
      check_in_time: checkInDate,
      check_out_time: payload.check_out_time
        ? new Date(payload.check_out_time)
        : null,
    },
    include: {
      staff: {
        select: {
          id: true,
          full_name: true,
          phone: true,
        },
      },
    },
  });

  return response;
};

const getAllStaffAttendancesFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, attendances] = await prisma.$transaction([
    prisma.staffAttendance.count({ where }),
    prisma.staffAttendance.findMany({
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
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: attendances,
  };
};

const getStaffAttendanceHistoryFromDB = async (staff_id: string) => {
  const staff = await prisma.staff.findUnique({
    where: { id: staff_id },
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      photo: true,
      gender: true,
      staff_type: true,
      is_active: true,
      designation: { select: { id: true, name: true } },
    },
  });

  if (!staff) {
    throw new AppError(404, 'Staff not found');
  }

  const records = await prisma.staffAttendance.findMany({
    where: { staff_id },
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

  const present = records.filter(
    (r) => r.attendance_status === 'PRESENT',
  ).length;
  const absent = records.filter((r) => r.attendance_status === 'ABSENT').length;
  const totalDays = records.length;
  const attendancePercentage =
    totalDays > 0 ? Number(((present / totalDays) * 100).toFixed(2)) : 0;

  return {
    staff,
    summary: {
      totalDays,
      present,
      absent,
      attendancePercentage,
    },
    data: records,
  };
};

const isTodayCheckInExists = async (staff_id: string) => {
  const today = getStartOfToday();

  const attendance = await prisma.staffAttendance.findUnique({
    where: {
      staff_id_attendance_date: {
        staff_id,
        attendance_date: today,
      },
    },
  });

  return {
    isCheckIn: attendance !== null,
    id: attendance?.id,
  };
};

const isTodayCheckOutExists = async (staff_id: string) => {
  const today = getStartOfToday();

  const attendance = await prisma.staffAttendance.findUnique({
    where: {
      staff_id_attendance_date: {
        staff_id,
        attendance_date: today,
      },
    },
    select: { check_out_time: true },
  });

  return !!attendance?.check_out_time;
};

const getTodayAttendanceStatusForStaff = async (staffIds: string[]) => {
  const today = getStartOfToday();

  const records = await prisma.staffAttendance.findMany({
    where: {
      staff_id: { in: staffIds },
      attendance_date: today,
    },
    select: { id: true, staff_id: true, check_out_time: true },
  });

  const statusMap: Record<
    string,
    { isCheckIn: boolean; checkInId?: string; isCheckOut: boolean }
  > = {};

  for (const staffId of staffIds) {
    const record = records.find((r) => r.staff_id === staffId);
    statusMap[staffId] = {
      isCheckIn: !!record,
      checkInId: record?.id,
      isCheckOut: !!record?.check_out_time,
    };
  }

  return statusMap;
};

const getStaffAttendanceByIdFromDB = async (id: string) => {
  const response = await prisma.staffAttendance.findUnique({
    where: { id },
    include: {
      staff: {
        select: {
          id: true,
          full_name: true,
          phone: true,
        },
      },
    },
  });

  return response;
};

const updateStaffAttendanceByIdIntoDB = async (
  id: string,
  payload: UpdateStaffAttendanceInput,
) => {
  try {
    return await prisma.staffAttendance.update({
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
        staff: {
          select: {
            id: true,
            full_name: true,
            phone: true,
          },
        },
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

const deleteStaffAttendanceByIdFromDB = async (id: string) => {
  try {
    return await prisma.staffAttendance.delete({ where: { id } });
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

const getStaffAttendanceReportFromDB = async (query: {
  staff_id?: string;
  staff_type?: string;
  designation_id?: string;
  start_date?: string;
  end_date?: string;
}) => {
  const where: Record<string, any> = {};

  if (query.staff_id) {
    where.staff_id = query.staff_id;
  }

  if (query.staff_type || query.designation_id) {
    const staffFilter: Record<string, string> = {};
    if (query.staff_type) {
      staffFilter.staff_type = query.staff_type;
    }
    if (query.designation_id) {
      staffFilter.designation_id = query.designation_id;
    }
    where.staff = staffFilter;
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

  const records = await prisma.staffAttendance.findMany({
    where,
    select: {
      staff_id: true,
      attendance_status: true,
      attendance_date: true,
      check_in_time: true,
      check_out_time: true,
      staff: {
        select: { id: true, full_name: true, phone: true },
      },
    },
    orderBy: { attendance_date: 'desc' },
  });

  // ── Overtime summary per staff for the same date range ──
  const overtimeDateFilter: Record<string, Date> = {};
  if (query.start_date) {
    overtimeDateFilter.gte = new Date(`${query.start_date}T00:00:00.000Z`);
  }
  if (query.end_date) {
    overtimeDateFilter.lte = new Date(`${query.end_date}T23:59:59.999Z`);
  }

  const staffIdsInReport = Array.from(new Set(records.map((r) => r.staff_id)));

  const [overtimeRecords, overtimeConfigs] = await Promise.all([
    staffIdsInReport.length > 0
      ? prisma.staffOvertime.findMany({
          where: {
            staff_id: { in: staffIdsInReport },
            end_time: { not: null },
            ...(Object.keys(overtimeDateFilter).length > 0
              ? { start_time: overtimeDateFilter }
              : {}),
          },
          select: { staff_id: true, overtime_hours: true },
        })
      : [],
    staffIdsInReport.length > 0
      ? prisma.overtimeStaffConfig.findMany({
          where: { staff_id: { in: staffIdsInReport } },
          select: { staff_id: true, overtime_hourly_amount: true },
        })
      : [],
  ]);

  const overtimeHoursMap = new Map<string, number>();
  for (const ot of overtimeRecords) {
    overtimeHoursMap.set(
      ot.staff_id,
      (overtimeHoursMap.get(ot.staff_id) ?? 0) + ot.overtime_hours,
    );
  }
  const hourlyRateMap = new Map(
    overtimeConfigs.map((c) => [c.staff_id, c.overtime_hourly_amount]),
  );

  const grouped = new Map<
    string,
    {
      staff_id: string;
      staff_name: string;
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
    const key = record.staff_id;
    if (!grouped.has(key)) {
      const hours = Number((overtimeHoursMap.get(key) ?? 0).toFixed(2));
      const rate = hourlyRateMap.get(key) ?? 0;
      grouped.set(key, {
        staff_id: record.staff_id,
        staff_name: record.staff.full_name,
        phone: record.staff.phone,
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
      totalStaffs: data.length,
      totalRecords: records.length,
      totalOvertimeHours,
      totalOvertimeAmount,
    },
  };
};

export const StaffAttendanceService = {
  createStaffAttendanceIntoDB,
  getAllStaffAttendancesFromDB,
  getStaffAttendanceByIdFromDB,
  isTodayCheckInExists,
  isTodayCheckOutExists,
  getTodayAttendanceStatusForStaff,
  updateStaffAttendanceByIdIntoDB,
  deleteStaffAttendanceByIdFromDB,
  getStaffAttendanceReportFromDB,
  getStaffAttendanceHistoryFromDB,
};