/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../db/db.config';
import { DashboardOverview, DashboardQuery } from './dashboard.type';

const safeParseJSON = (value: unknown): Record<string, any> => {
  if (!value) return {};

  if (typeof value === 'object') return value as Record<string, any>;

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }

  return {};
};

const getDateRange = (query: DashboardQuery) => {
  const { startDate, endDate } = query;

  if (!startDate && !endDate) {
    return null;
  }

  const range: { gte?: Date; lte?: Date } = {};

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    range.gte = start;
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    range.lte = end;
  }

  return range;
};

const buildAttendanceOverview = (
  groups: { attendance_status: string; _count: { _all: number } }[],
): {
  present: number;
  absent: number;
  total: number;
  percentage: number;
} => {
  let present = 0;
  let absent = 0;

  for (const group of groups) {
    if (group.attendance_status === 'PRESENT') {
      present = group._count._all;
    } else if (group.attendance_status === 'ABSENT') {
      absent = group._count._all;
    }
  }

  const total = present + absent;
  const percentage =
    total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0;

  return { present, absent, total, percentage };
};

const buildLeaveOverview = (
  groups: { leave_status: string; _count: { _all: number } }[],
): {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
} => {
  let approved = 0;
  let pending = 0;
  let rejected = 0;

  for (const group of groups) {
    if (group.leave_status === 'APPROVED') {
      approved = group._count._all;
    } else if (group.leave_status === 'PENDING') {
      pending = group._count._all;
    } else if (group.leave_status === 'REJECTED') {
      rejected = group._count._all;
    }
  }

  return {
    total: approved + pending + rejected,
    approved,
    pending,
    rejected,
  };
};

const getDashboardOverviewFromDB = async (
  query: DashboardQuery,
): Promise<DashboardOverview> => {
  const dateRange = getDateRange(query);
  const filter = safeParseJSON(query.filter);

  const studentFilter = filter?.student ?? {};
  const teacherFilter = filter?.teacher ?? {};
  const staffFilter = filter?.staff ?? {};
  const studentAttendanceFilter = filter?.studentAttendance ?? {};
  const teacherAttendanceFilter = filter?.teacherAttendance ?? {};
  const staffAttendanceFilter = filter?.staffAttendance ?? {};
  const teacherLeaveFilter = filter?.teacherLeave ?? {};
  const staffLeaveFilter = filter?.staffLeave ?? {};

  // ── Summary counts (lifetime totals, filterable) ─────────────────────
  const [totalStudents, totalTeachers, totalStaff] = await Promise.all([
    prisma.student.count({ where: studentFilter }),
    prisma.teacher.count({ where: teacherFilter }),
    prisma.staff.count({ where: staffFilter }),
  ]);

  // ── Student overview ───────────────────────────────────────────────────
  const [studentGenderGroups, studentReligionGroups, latestEnrollments] =
    await Promise.all([
      prisma.student.groupBy({
        by: ['gender'],
        where: studentFilter,
        _count: { _all: true },
      }),

      prisma.student.groupBy({
        by: ['religion'],
        where: studentFilter,
        _count: { _all: true },
      }),

      // Latest enrollment per student (distinct on student_id) to avoid
      // double-counting students with historical enrollment records.
      prisma.studentEnrollment.findMany({
        distinct: ['student_id'],
        orderBy: { created_at: 'desc' },
        where: {
          student: studentFilter,
        },
        select: {
          student_id: true,
          academic_class_id: true,
        },
      }),
    ]);

  // Group latest enrollments by class in JS (one row per student only)
  const classCountMap = new Map<string, number>();
  for (const enrollment of latestEnrollments) {
    classCountMap.set(
      enrollment.academic_class_id,
      (classCountMap.get(enrollment.academic_class_id) ?? 0) + 1,
    );
  }

  const classFilter = filter?.class ?? {};
  const classIds = Array.from(classCountMap.keys());
  const classes = classIds.length
    ? await prisma.academicClass.findMany({
        where: { ...classFilter, id: { in: classIds } },
        select: { id: true, class_name: true },
      })
    : [];

  const classWise = classes.map((cls) => ({
    classId: cls.id,
    className: cls.class_name,
    count: classCountMap.get(cls.id) ?? 0,
  }));

  // ── Teacher overview ──────────────────────────────────────────────────
  const [teacherGenderGroups, teacherTypeGroups, teacherSubjectGroups] =
    await Promise.all([
      prisma.teacher.groupBy({
        by: ['gender'],
        where: teacherFilter,
        _count: { _all: true },
      }),

      prisma.teacher.groupBy({
        by: ['teacher_type'],
        where: teacherFilter,
        _count: { _all: true },
      }),

      prisma.teacher.groupBy({
        by: ['subject_id'],
        where: teacherFilter,
        _count: { _all: true },
      }),
    ]);

  const subjectFilter = filter?.subject ?? {};
  const subjectIds = teacherSubjectGroups
    .map((group) => group.subject_id)
    .filter((id): id is string => id !== null);

  const subjects = subjectIds.length
    ? await prisma.subject.findMany({
        where: { ...subjectFilter, id: { in: subjectIds } },
        select: { id: true, name: true },
      })
    : [];

  const subjectNameMap = new Map(
    subjects.map((subject) => [subject.id, subject.name]),
  );

  const subjectWise = teacherSubjectGroups.map((group) => ({
    subjectId: group.subject_id,
    subjectName: group.subject_id
      ? (subjectNameMap.get(group.subject_id) ?? null)
      : null,
    count: group._count._all,
  }));

  // ── Staff overview ────────────────────────────────────────────────────
  const [staffGenderGroups] = await Promise.all([
    prisma.staff.groupBy({
      by: ['gender'],
      where: staffFilter,
      _count: { _all: true },
    }),
  ]);

  // ── Attendance overview (date-filtered + filterable) ─────────────────
  const studentAttendanceWhere = {
    ...studentAttendanceFilter,
    ...(dateRange ? { attendance_date: dateRange } : {}),
  };

  const teacherAttendanceWhere = {
    ...teacherAttendanceFilter,
    ...(dateRange ? { check_in_time: dateRange } : {}),
  };

  const staffAttendanceWhere = {
    ...staffAttendanceFilter,
    ...(dateRange ? { check_in_time: dateRange } : {}),
  };

  const [studentAttendanceGroups, teacherAttendanceGroups, staffAttendanceGroups] =
    await Promise.all([
      prisma.studentAttendance.groupBy({
        by: ['attendance_status'],
        where: studentAttendanceWhere,
        _count: { _all: true },
      }),

      prisma.teacherAttendance.groupBy({
        by: ['attendance_status'],
        where: teacherAttendanceWhere,
        _count: { _all: true },
      }),

      prisma.staffAttendance.groupBy({
        by: ['attendance_status'],
        where: staffAttendanceWhere,
        _count: { _all: true },
      }),
    ]);

  // ── Leave overview (date-filtered + filterable) ──────────────────────
  const teacherLeaveWhere = {
    ...teacherLeaveFilter,
    ...(dateRange ? { leave_start_date: dateRange } : {}),
  };

  const staffLeaveWhere = {
    ...staffLeaveFilter,
    ...(dateRange ? { leave_start_date: dateRange } : {}),
  };

  const [teacherLeaveGroups, staffLeaveGroups] = await Promise.all([
    prisma.teacherLeaveRequest.groupBy({
      by: ['leave_status'],
      where: teacherLeaveWhere,
      _count: { _all: true },
    }),

    prisma.staffLeave.groupBy({
      by: ['leave_status'],
      where: staffLeaveWhere,
      _count: { _all: true },
    }),
  ]);

  const teacherLeaves = buildLeaveOverview(teacherLeaveGroups);
  const staffLeaves = buildLeaveOverview(staffLeaveGroups);

  // No StudentLeave model exists in the schema
  const studentLeaves = { total: 0, approved: 0, pending: 0, rejected: 0 };

  const studentGender: Record<string, number> = {};
  for (const group of studentGenderGroups) {
    studentGender[group.gender] = group._count._all;
  }

  const teacherGender: Record<string, number> = {};
  for (const group of teacherGenderGroups) {
    teacherGender[group.gender] = group._count._all;
  }

  const staffGender: Record<string, number> = {};
  for (const group of staffGenderGroups) {
    staffGender[group.gender] = group._count._all;
  }

  return {
    summary: {
      totalStudents,
      totalTeachers,
      totalStaff,
      totalStudentLeaves: studentLeaves.total,
      totalTeacherLeaves: teacherLeaves.total,
      totalStaffLeaves: staffLeaves.total,
    },
    students: {
      gender: studentGender,
      religion: studentReligionGroups.map((group) => ({
        religion: group.religion,
        count: group._count._all,
      })),
      classWise,
    },
    teachers: {
      gender: teacherGender,
      typeWise: teacherTypeGroups.map((group) => ({
        teacherType: group.teacher_type,
        count: group._count._all,
      })),
      subjectWise,
    },
    staff: {
      gender: staffGender,
    },
    attendance: {
      students: buildAttendanceOverview(studentAttendanceGroups),
      teachers: buildAttendanceOverview(teacherAttendanceGroups),
      staff: buildAttendanceOverview(staffAttendanceGroups),
    },
    leaves: {
      students: studentLeaves,
      teachers: teacherLeaves,
      staff: staffLeaves,
    },
  };
};

export const DashboardService = {
  getDashboardOverviewFromDB,
};