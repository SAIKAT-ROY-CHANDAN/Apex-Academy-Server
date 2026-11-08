import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import {
  CreateManyStudentAttendanceInput,
  CreateStudentAttendanceInput,
  UpdateManyStudentAttendanceInput,
  UpdateStudentAttendanceInput,
} from './studentAttendance.type';
import type { StudentGroup } from '../../../../generated/prisma/enums';
import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';

const getDayRange = (date: Date) => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
  return { startOfDay, endOfDay };
};

const createStudentAttendanceIntoDB = async (
  payload: CreateStudentAttendanceInput,
) => {
  const response = await prisma.studentAttendance.create({
    data: {
      ...payload,
      attendance_date: new Date(payload.attendance_date),
    },
    include: {
      student: true,
      subject: true,
      academicClass: true,
    },
  });

  return response;
};

const createManyStudentAttendancesIntoDB = async (
  payload: CreateManyStudentAttendanceInput,
) => {
  if (payload.length === 0) {
    return { count: 0 };
  }

  // Prevent re-submitting attendance for the same day/context, e.g.
  // the same school class (group) or college subject already marked today.
  // The check + insert run inside a single transaction so concurrent
  // double-submits cannot both pass the duplicate guard.
  const first = payload[0];
  const { startOfDay, endOfDay } = getDayRange(
    new Date(first.attendance_date),
  );

  const duplicateWhere = {
    ...(first.teacher_id ? { teacher_id: first.teacher_id } : {}),
    ...(first.academic_class_id
      ? { academic_class_id: first.academic_class_id }
      : {}),
    ...(first.subject_id ? { subject_id: first.subject_id } : {}),
    ...(first.group ? { group: first.group } : {}),
    attendance_date: { gte: startOfDay, lt: endOfDay },
  };

  const response = await prisma.$transaction(async (tx) => {
    const existingCount = await tx.studentAttendance.count({
      where: duplicateWhere,
    });

    if (existingCount > 0) {
      throw new Error(
        'Attendance already submitted for today for this class/subject.',
      );
    }

    return tx.studentAttendance.createMany({
      data: payload.map((item) => ({
        ...item,
        attendance_date: new Date(item.attendance_date),
      })),
    });
  });

  return response;
};

const getAllStudentAttendancesFromDB = async (query: QueryParams) => {
  const { orderBy, skip, take, where, page } = buildPrismaQuery(query, {
    searchFields: [],
  });

  const [totalItems, studentAttendances] = await prisma.$transaction([
    prisma.studentAttendance.count({ where }),
    prisma.studentAttendance.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        student: {
          include: {
            // Only the current (primary) enrollment — a promoted student owns
            // closed history rows too, and callers must not get [0] of N rows.
            studentEnrollments: {
              where: { is_primary: true },
              select: {
                is_primary: true,
                academic_session_id: true,
                academic_class_id: true,
                roll_number: true,
                registration_number: true,
              },
            },
          },
        },
        subject: true,
        academicClass: true,
        teacher: { select: { id: true, full_name: true } },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: studentAttendances,
  };
};

const getStudentAttendanceByIdFromDB = async (id: string) => {
  const response = await prisma.studentAttendance.findUnique({
    where: {
      id,
    },
    include: {
      student: true,
      subject: true,
      academicClass: true,
    },
  });

  return response;
};

const updateStudentAttendanceByIdIntoDB = async (
  id: string,
  payload: UpdateStudentAttendanceInput,
) => {
  const response = await prisma.studentAttendance.update({
    where: {
      id,
    },
    data: {
      ...payload,
      ...(payload.attendance_date && {
        attendance_date: new Date(payload.attendance_date),
      }),
    },
  });

  return response;
};

// Bulk-update attendance statuses. When the requester is a teacher, only
// records originally taken by that teacher can be edited.
const updateManyStudentAttendancesIntoDB = async (
  updates: UpdateManyStudentAttendanceInput,
  requester?: { id: string; userType?: string },
) => {
  if (updates.length === 0) {
    return { count: 0 };
  }

  const ids = updates.map((u) => u.id);
  const existing = await prisma.studentAttendance.findMany({
    where: { id: { in: ids } },
    select: { id: true, teacher_id: true },
  });

  if (existing.length !== ids.length) {
    throw new AppError(404, 'One or more attendance records not found');
  }

  if (requester?.userType === 'teacher') {
    const foreign = existing.filter((r) => r.teacher_id !== requester.id);
    if (foreign.length > 0) {
      throw new AppError(
        403,
        'You can only edit attendance taken by yourself',
      );
    }
  }

  const statusById = new Map(updates.map((u) => [u.id, u.attendance_status]));

  await prisma.$transaction(
    ids.map((id) =>
      prisma.studentAttendance.update({
        where: { id },
        data: { attendance_status: statusById.get(id)! },
      }),
    ),
  );

  return { count: updates.length };
};

const deleteStudentAttendanceByIdFromDB = async (id: string) => {
  const response = await prisma.studentAttendance.delete({
    where: {
      id,
    },
  });

  return response;
};

const getTodayAttendanceStatusFromDB = async (query: {
  academic_class_id?: string;
  subject_id?: string;
  group?: StudentGroup;
  teacher_id?: string;
  attendance_date?: string;
}) => {
  const date = query.attendance_date
    ? new Date(query.attendance_date)
    : new Date();
  const { startOfDay, endOfDay } = getDayRange(date);

  const count = await prisma.studentAttendance.count({
    where: {
      ...(query.teacher_id ? { teacher_id: query.teacher_id } : {}),
      ...(query.academic_class_id
        ? { academic_class_id: query.academic_class_id }
        : {}),
      ...(query.subject_id ? { subject_id: query.subject_id } : {}),
      ...(query.group ? { group: query.group } : {}),
      attendance_date: { gte: startOfDay, lt: endOfDay },
    },
  });

  return { exists: count > 0, count };
};

const getClassTakenReportFromDB = async (query: {
  academic_class_id?: string;
  program_id?: string;
  department_id?: string;
  subject_id?: string;
  teacher_id?: string;
  administrative_position?: string;
  group?: string;
  start_date?: string;
  end_date?: string;
}) => {
  const where: Record<string, unknown> = {};

  if (query.academic_class_id) where.academic_class_id = query.academic_class_id;
  // Scope the report to a program/department via the class relation, so the
  // nested Program > Department > Year > Subject filters actually narrow rows.
  if (query.program_id || query.department_id) {
    where.academicClass = {
      ...(query.program_id ? { program: { id: query.program_id } } : {}),
      ...(query.department_id
        ? { department: { id: query.department_id } }
        : {}),
    };
  }
  if (query.subject_id) where.subject_id = query.subject_id;
  if (query.teacher_id) where.teacher_id = query.teacher_id;
  if (query.administrative_position) {
    where.teacher = { administrative_position: query.administrative_position };
  }
  if (query.group) where.group = query.group as never;

  if (query.start_date || query.end_date) {
    const dateFilter: Record<string, Date> = {};
    if (query.start_date) {
      dateFilter.gte = new Date(`${query.start_date}T00:00:00.000Z`);
    }
    if (query.end_date) {
      dateFilter.lte = new Date(`${query.end_date}T23:59:59.999Z`);
    }
    where.attendance_date = dateFilter as never;
  }

  const rows = await prisma.studentAttendance.findMany({
    where,
    select: {
      attendance_date: true,
      attendance_status: true,
      teacher: { select: { id: true, full_name: true } },
      academicClass: { select: { id: true, class_name: true } },
      subject: { select: { id: true, name: true } },
      group: true,
    },
    orderBy: { attendance_date: 'desc' },
  });

  // Aggregate into "class taken" rows grouped by
  // (attendance date, teacher, academic class, subject, group).
  const grouped = new Map<string, ReportRow>();

  for (const row of rows) {
    const dateOnly = row.attendance_date.toISOString().split('T')[0];
    const key = [
      dateOnly,
      row.teacher?.id ?? '',
      row.academicClass?.id ?? '',
      row.subject?.id ?? '',
      row.group ?? '',
    ].join('|');

    let entry = grouped.get(key);
    if (!entry) {
      entry = {
        attendance_date: dateOnly,
        teacher_id: row.teacher?.id ?? null,
        teacher_name: row.teacher?.full_name ?? 'N/A',
        academic_class_id: row.academicClass?.id ?? null,
        class_name: row.academicClass?.class_name ?? 'N/A',
        subject_id: row.subject?.id ?? null,
        subject_name: row.subject?.name ?? 'N/A',
        group: row.group ?? null,
        total: 0,
        present: 0,
        absent: 0,
      };
      grouped.set(key, entry);
    }

    entry.total += 1;
    if (row.attendance_status === 'PRESENT') entry.present += 1;
    else entry.absent += 1;
  }

  return {
    data: Array.from(grouped.values()),
    meta: { totalGroups: grouped.size, totalRecords: rows.length },
  };
};

type ReportRow = {
  attendance_date: string;
  teacher_id: string | null;
  teacher_name: string;
  academic_class_id: string | null;
  class_name: string;
  subject_id: string | null;
  subject_name: string;
  group: string | null;
  total: number;
  present: number;
  absent: number;
};

export const StudentAttendanceService = {
  createStudentAttendanceIntoDB,
  createManyStudentAttendancesIntoDB,
  getTodayAttendanceStatusFromDB,
  getClassTakenReportFromDB,
  getAllStudentAttendancesFromDB,
  getStudentAttendanceByIdFromDB,
  updateStudentAttendanceByIdIntoDB,
  updateManyStudentAttendancesIntoDB,
  deleteStudentAttendanceByIdFromDB,
};
